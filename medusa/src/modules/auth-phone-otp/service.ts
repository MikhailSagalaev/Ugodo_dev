import { 
  AuthenticationInput, 
  AuthenticationResponse, 
  AuthIdentityProviderService, 
  AuthIdentityDTO,
  Logger
} from "@medusajs/framework/types";
import { 
  AbstractAuthModuleProvider,
  MedusaError 
} from "@medusajs/framework/utils"
import { ICacheService } from "@medusajs/framework/types";
import SmscClient from "../../lib/smsc-client";
import { generate } from 'otp-generator';

type InjectedDependencies = {
  logger: Logger;
  cacheService: ICacheService;
  authIdentityProviderService: AuthIdentityProviderService;
};

type SmsOtpProviderOptions = {
  smscLogin?: string; // Логин для SMSC.RU, если не используется SMSC_LOGIN из env
  smscPassword?: string; // Пароль/API-ключ для SMSC.RU, если не используется SMSC_PASSWORD из env
  otpLength?: number; // Длина OTP, по умолчанию из env OTP_LENGTH или 6
  otpTtlSeconds?: number; // Время жизни OTP в секундах, по умолчанию из env OTP_TTL_SECONDS или 300
  senderName?: string; // Имя отправителя SMS (если поддерживается SMSC)
};

const DEFAULT_OTP_LENGTH = 6;
const DEFAULT_OTP_TTL_SECONDS = 300; // 5 минут

/**
 * @swagger
 * /store/auth/sms-otp/register:
 *   post:
 *     operationId: "PostStoreAuthSmsOtpRegister"
 *     summary: "Request OTP for SMS Authentication (via sms-otp provider)"
 *     description: "Requests an OTP (One-Time Password) to be sent to the provided phone number. This is the first step in SMS-based login or registration, handled by the 'sms-otp' auth provider."
 *     tags:
 *       - Auth
 *     requestBody:
 *       $ref: '#/components/requestBodies/StoreAuthSmsOtpRegisterBody' # Определено в store/index.ts или общем файле
 *     responses:
 *       "200": # Успешный вызов метода register провайдера
 *         description: "OTP request acknowledged by the provider. Success indicates the provider attempted to send OTP."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "True if the provider successfully processed the request (e.g., attempted to send OTP)."
 *                   example: true
 *                 # Провайдер НЕ должен возвращать customer data или authIdentity на этом этапе
 *       "400": # Ошибки валидации от провайдера
 *         description: "Bad Request. Likely missing or invalid phone_number, as validated by the sms-otp provider."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "Phone number is required."
 *       "500": # Внутренние ошибки провайдера
 *         description: "Internal Server Error within the sms-otp provider (e.g., failed to contact SMS gateway)."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "Failed to send OTP. Please try again later."
 *
 * /store/auth/sms-otp/authenticate:
 *   post:
 *     operationId: "PostStoreAuthSmsOtpAuth"
 *     summary: "Authenticate with OTP (via sms-otp provider)"
 *     description: "Verifies the OTP code sent to the phone number and authenticates the customer using the 'sms-otp' auth provider. If successful, Medusa's auth flow will establish a session."
 *     tags:
 *       - Auth
 *     requestBody:
 *       $ref: '#/components/requestBodies/StoreAuthSmsOtpAuthBody' # Определено в store/index.ts или общем файле
 *     responses:
 *       "200": # Успешный вызов метода authenticate провайдера
 *         description: "Authentication processed by the provider. If 'success' is true, Medusa's auth flow proceeds to establish a session and may return customer data or set cookies."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "True if OTP was valid and provider authenticated the identity."
 *                   example: true
 *                 authIdentity:
 *                   $ref: '#/components/schemas/AuthIdentityDTO' # Определено в store/index.ts
 *                 # Конечный ответ клиенту будет сформирован Medusa Auth Core,
 *                 # он может включать customer data и session cookie.
 *       "400": # Ошибки валидации от провайдера
 *         description: "Bad Request. Likely missing phone_number or otp_code, as validated by the sms-otp provider."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Phone number and OTP code are required."
 *       "401": # Ошибки аутентификации от провайдера
 *         description: "Unauthorized. Invalid or expired OTP code, as determined by the sms-otp provider."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP code."
 *       "500": # Внутренние ошибки провайдера
 *         description: "Internal Server Error within the sms-otp provider."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "An error occurred during authentication. Please try again."
 */
class SmsOtpAuthService extends AbstractAuthModuleProvider {
  static identifier = "sms-otp";
  static DISPLAY_NAME = "SMS OTP Authentication";

  protected readonly logger_: Logger;
  protected readonly cacheService_: ICacheService;
  protected readonly authIdentityProviderService_: AuthIdentityProviderService;
  protected readonly smscClient_: SmscClient;
  protected readonly options_: SmsOtpProviderOptions;

  constructor(
    dependencies: InjectedDependencies,
    options: SmsOtpProviderOptions = {}
  ) {
    super();
    this.logger_ = dependencies.logger;
    this.cacheService_ = dependencies.cacheService;
    this.authIdentityProviderService_ = dependencies.authIdentityProviderService;
    this.options_ = options;

    this.smscClient_ = new SmscClient({
      login: this.options_.smscLogin || process.env.SMSC_LOGIN,
      password: this.options_.smscPassword || process.env.SMSC_PASSWORD,
      logger: this.logger_,
    });
  }

  // Метод для запроса OTP (используется как 'register' в терминах Medusa Auth)
  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { body } = data;
    const phoneNumber = body?.phone_number as string;

    if (!phoneNumber) {
      return {
        success: false,
        error: "Phone number is required."
      };
    }

    const otpLength = this.options_.otpLength || parseInt(process.env.OTP_LENGTH || '' + DEFAULT_OTP_LENGTH, 10);
    const otpTtlSeconds = this.options_.otpTtlSeconds || parseInt(process.env.OTP_TTL_SECONDS || '' + DEFAULT_OTP_TTL_SECONDS, 10);

    const otpCode = generate(otpLength, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    //this.logger_.warn("Using mocked OTP '123456' because otp-generator is not installed or temporarily commented out.")

    const otpMessage = `Your OTP code is: ${otpCode}`;
    const cacheKey = `otp:${phoneNumber}`;

    try {
      this.logger_.info(`Attempting to send OTP to ${phoneNumber}`);
      await this.smscClient_.sendSms({
        phones: phoneNumber,
        mes: otpMessage,
        sender: this.options_.senderName,
      });

      await this.cacheService_.set(cacheKey, { code: otpCode, attempts: 0 }, otpTtlSeconds);
      this.logger_.info(`OTP for ${phoneNumber} sent and cached successfully.`);

      return {
        success: true
      };
    } catch (error) {
      const err = error as (Error & { error_code?: number });
      this.logger_.error(`Failed to send OTP to ${phoneNumber}: ${err.message || err}`);
      return {
        success: false,
        error: "Failed to send OTP. Please try again later."
      };
    }
  }

  // Метод для проверки OTP и аутентификации/создания пользователя
  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { body } = data;
    const phoneNumber = body?.phone_number as string;
    const otpCode = body?.otp_code as string;

    if (!phoneNumber || !otpCode) {
      return {
        success: false,
        error: "Phone number and OTP code are required."
      };
    }

    const cacheKey = `otp:${phoneNumber}`;
    try {
      const cachedOtpData = await this.cacheService_.get<{ code: string; attempts: number }>(cacheKey);

      if (!cachedOtpData) {
        return {
          success: false,
          error: "OTP expired or not found. Please request a new one."
        };
      }

      if (cachedOtpData.code !== otpCode) {
        return {
          success: false,
          error: "Invalid OTP code."
        };
      }

      if (typeof this.cacheService_.invalidate === 'function') {
        await this.cacheService_.invalidate(cacheKey);
      } else if (typeof (this.cacheService_ as any).del === 'function') {
        await (this.cacheService_ as any).del(cacheKey);
      } else {
        this.logger_.warn(`Cache service does not have invalidate or del method for key: ${cacheKey}. OTP not invalidated.`);
      }
      
      let authIdentity: AuthIdentityDTO;
      try {
        // Пытаемся найти существующую AuthIdentity по номеру телефона
        authIdentity = await authIdentityProviderService.retrieve({
          entity_id: phoneNumber, // entity_id должен быть уникальным идентификатором пользователя в этой системе аутентификации
          // provider_id: SmsOtpAuthService.identifier // Medusa должна сама сопоставить это с текущим провайдером
        });
        this.logger_.info(`Found existing auth identity for ${phoneNumber}`);
      } catch (e) {
        // Если не найдено, создаем новую AuthIdentity
        this.logger_.info(`No existing auth identity for ${phoneNumber}, creating new one.`);
        authIdentity = await authIdentityProviderService.create({
          entity_id: phoneNumber,
          // provider_id: SmsOtpAuthService.identifier, 
          // provider_metadata: {}, // Можно хранить специфичные для провайдера данные
          // user_metadata: {} // Можно хранить метаданные пользователя (если Customer еще не создан)
        });
      }
      
      this.logger_.info(`User ${phoneNumber} authenticated successfully via OTP. AuthIdentity ID: ${authIdentity.id}`);
      return { success: true, authIdentity };

    } catch (error) {
      const err = error as Error;
      this.logger_.error(`Error during OTP authentication for ${phoneNumber}: ${err.message || err}`);
      return {
        success: false,
        error: "An error occurred during authentication. Please try again."
      };
    }
  }

  // validateCallback не нужен для этого типа потока, так как нет редиректа
}

export default SmsOtpAuthService; 