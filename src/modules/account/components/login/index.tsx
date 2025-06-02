import React from 'react'
import { Button } from '@medusajs/ui'
import Link from 'next/link'

export default function Login() {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0">
      <Link href="/account/login-sms" className="w-full">
        <Button variant="primary" className="w-full">Вход по SMS</Button>
      </Link>
    </div>
  )
}
