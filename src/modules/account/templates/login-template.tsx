"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import LoginSMS from "@modules/account/components/login-sms"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  SMS = "sms",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === LOGIN_VIEW.SIGN_IN ? (
        <Login setCurrentView={setCurrentView} />
      ) : currentView === LOGIN_VIEW.REGISTER ? (
        <Register setCurrentView={setCurrentView} />
      ) : (
        <LoginSMS setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
