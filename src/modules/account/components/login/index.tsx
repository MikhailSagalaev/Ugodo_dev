import React, { useState } from 'react'
import LoginSMS from '../login-sms'
import LoginEmailPass from '../login-emailpass'
import { Button } from '@medusajs/ui'

// Единственный способ входа — по SMS (OTP)
export default function Login(props: any) {
  const [method, setMethod] = useState<'sms' | 'email'>('sms')

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0">
      <div className="flex gap-2 mb-4">
        <Button variant={method === 'sms' ? 'primary' : 'secondary'} onClick={() => setMethod('sms')}>По SMS</Button>
        <Button variant={method === 'email' ? 'primary' : 'secondary'} onClick={() => setMethod('email')}>По email/паролю</Button>
      </div>
      {method === 'sms' ? <LoginSMS {...props} /> : <LoginEmailPass {...props} />}
    </div>
  )
}
