import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        <div className={customer ? "grid grid-cols-1 small:grid-cols-[240px_1fr] py-12" : "flex justify-center items-center min-h-[600px] py-12"}>
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className={customer ? "flex-1" : "w-full max-w-md"}>{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">Остались вопросы?</h3>
            <span className="txt-medium">
              Вы можете найти часто задаваемые вопросы и ответы на нашей странице
              службы поддержки.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Служба поддержки
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
