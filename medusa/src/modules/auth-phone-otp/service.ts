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
      } else {
        this.logger_.warn(`Cache service does not have invalidate method for key: ${cacheKey}`);
      }

      // Используем только create/retrieve, как в документации
      let authIdentity: AuthIdentityDTO;
      try {
        authIdentity = await authIdentityProviderService.retrieve({
          entity_id: phoneNumber
        });
      } catch (e) {
        authIdentity = await authIdentityProviderService.create({
          entity_id: phoneNumber,
          provider_metadata: {},
          user_metadata: {}
        });
      }

      this.logger_.info(`User ${phoneNumber} authenticated successfully via OTP.`);
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
  // async validateCallback(...) { ... }
}

export default SmsOtpAuthService; 