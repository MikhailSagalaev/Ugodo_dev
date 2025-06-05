import { Metadata } from "next"
import LoginSms from "@modules/account/components/login-sms/LoginSms"

export const metadata: Metadata = {
  title: "Вход по SMS",
  description: "Войдите в свой аккаунт используя SMS код",
}

export default function LoginSmsPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
      <LoginSms />
    </div>
  )
} 