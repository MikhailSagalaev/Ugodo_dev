import { Metadata } from "next"
import RegisterSms from "@modules/account/components/login-sms/RegisterSms"

export const metadata: Metadata = {
  title: "Регистрация по SMS",
  description: "Создайте новый аккаунт используя SMS код",
}

export default function RegisterSmsPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
      <RegisterSms />
    </div>
  )
} 