/**
 * @file: page.tsx
 * @description: Главная страница аккаунта. Выбор между входом и регистрацией по SMS.
 * @dependencies: retrieveCustomer, @medusajs/ui, next/navigation
 * @created: 2024-07-31
 */

import { redirect } from 'next/navigation'
import { retrieveCustomer } from '@lib/data/customer'
import { Button } from '@medusajs/ui'
import Link from 'next/link'
import Overview from '@modules/account/components/overview'

export default async function AccountPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (customer) {
    // Показываем личный кабинет сразу
    const orders = null // Можно добавить загрузку заказов, если нужно
    return <Overview customer={customer} orders={orders} />
  }
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0 mx-auto mt-16">
      <Link href="/account/sms-auth" className="w-full">
        <Button variant="primary" className="w-full">Войти по SMS</Button>
      </Link>
    </div>
  )
} 