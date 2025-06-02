"use client"

import { Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import { Button } from "@medusajs/ui"

type CartSidebarProps = {
  cart?: HttpTypes.StoreCart | null
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  onClearCart?: () => void
}

export default function CartSidebar({
  cart,
  isOpen,
  setIsOpen,
  onClearCart
}: CartSidebarProps) {
  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const subtotal = cart?.subtotal ?? 0

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, setIsOpen])

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-[765px]">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Заголовок */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <h2 className="text-black text-[35px] font-medium leading-tight">
                          корзина
                        </h2>
                        <span className="text-black text-[20px] font-medium leading-tight">
                          / {totalItems}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Кнопка очистки корзины */}
                        {totalItems > 0 && (
                          <button
                            onClick={onClearCart}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Очистить корзину"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                          </button>
                        )}

                        {/* Кнопка закрытия */}
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          aria-label="Закрыть корзину"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Содержимое корзины */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                      {cart && cart.items?.length ? (
                        <div className="space-y-6">
                          {cart.items
                            .sort((a, b) => {
                              return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                            })
                            .map((item) => (
                              <div key={item.id} className="flex gap-4">
                                {/* Картинка товара */}
                                <div className="flex-shrink-0">
                                  <LocalizedClientLink href={`/products/${item.product_handle}`}>
                                    {item.thumbnail ? (
                                      <Image
                                        src={item.thumbnail}
                                        alt={item.title}
                                        width={110}
                                        height={110}
                                        className="object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-[110px] h-[110px] bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">Нет фото</span>
                                      </div>
                                    )}
                                  </LocalizedClientLink>
                                </div>

                                {/* Информация о товаре */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0 mr-4">
                                      {/* Тип товара */}
                                      {item.variant?.product?.type?.value && (
                                        <div className="text-gray-500 mb-1 text-[9px] font-medium tracking-widest uppercase leading-tight">
                                          {item.variant.product.type.value}
                                        </div>
                                      )}

                                      {/* Название товара */}
                                      <h3 className="text-black mb-2 truncate text-[18px] font-medium leading-snug">
                                        <LocalizedClientLink href={`/products/${item.product_handle}`}>
                                          {item.title}
                                        </LocalizedClientLink>
                                      </h3>

                                      {/* Опции товара */}
                                      <LineItemOptions variant={item.variant} />

                                      {/* Количество */}
                                      <div className="text-gray-600 text-sm mt-2">
                                        Количество: {item.quantity}
                                      </div>
                                    </div>

                                    {/* Цена */}
                                    <div className="flex-shrink-0">
                                      <LineItemPrice
                                        item={item}
                                        style="tight"
                                        currencyCode={cart.currency_code}
                                      />
                                    </div>
                                  </div>

                                  {/* Кнопка удаления */}
                                  <DeleteButton id={item.id} className="text-sm text-red-600 hover:text-red-800">
                                    Удалить
                                  </DeleteButton>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="mb-4">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Корзина пуста</h3>
                          <p className="text-gray-500 mb-6">Добавьте товары, чтобы продолжить покупки</p>
                          <LocalizedClientLink href="/store">
                            <Button onClick={() => setIsOpen(false)}>
                              Смотреть товары
                            </Button>
                          </LocalizedClientLink>
                        </div>
                      )}
                    </div>

                    {/* Итого и кнопка оформления */}
                    {cart && cart.items?.length ? (
                      <div className="border-t border-gray-200 px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-lg font-medium">Итого:</span>
                          <span className="text-xl font-semibold">
                            {convertToLocale({
                              amount: subtotal,
                              currency_code: cart.currency_code,
                            })}
                          </span>
                        </div>
                        
                        <LocalizedClientLink href="/checkout">
                          <Button 
                            className="w-full h-12 bg-black text-white hover:bg-gray-800"
                            onClick={() => setIsOpen(false)}
                          >
                            Оформить заказ
                          </Button>
                        </LocalizedClientLink>
                      </div>
                    ) : null}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 