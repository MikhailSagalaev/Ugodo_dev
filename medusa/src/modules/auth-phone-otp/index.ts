import { Module } from "@medusajs/framework/utils";
import SmsOtpAuthService from "./service";

export const AUTH_PHONE_OTP_MODULE = "authPhoneOtp"; // Уникальный идентификатор вашего модуля

export default Module(AUTH_PHONE_OTP_MODULE, {
  service: SmsOtpAuthService, // Используем service для единственного основного сервиса
}); 