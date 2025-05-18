import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Вход в систему",
  description: "Вход в личный кабинет",
}

export default function Login() {
  return <LoginTemplate />
}
