"use client"

import React from 'react'
import { Button } from '@medusajs/ui'
import Link from 'next/link'

// Единственный способ регистрации — по SMS (OTP)
export default function Register() {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0">
      <Link href="/account/register-sms" className="w-full">
        <Button variant="primary" className="w-full">Регистрация по SMS</Button>
      </Link>
    </div>
  )
}
