import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/framework"
import { type OtpGeneratedEvent, Events } from "@perseidesjs/auth-otp/types"
import { sendOtpSms } from "../lib/smsc-sender";

export default async function preRegisterOtpGeneratedHandler({
  event: { data },
  container
}: SubscriberArgs<OtpGeneratedEvent>) {
  const { otp, identifier } = data
  console.log("PRE_REGISTER_OTP_GENERATED event: An OTP was generated for pre-registration for identifier:", identifier, "OTP:", otp)

  try {
    await sendOtpSms(identifier, otp);
    console.log(`OTP SMS sent to ${identifier} via preRegisterOtpGeneratedHandler for pre-registration.`);
  } catch (error) {
    console.error(`Failed to send OTP SMS to ${identifier} via preRegisterOtpGeneratedHandler for pre-registration:`, error);
    // Здесь можно добавить дополнительную логику обработки ошибок
  }
}

export const config: SubscriberConfig = {
  event: Events.PRE_REGISTER_OTP_GENERATED, 
} 