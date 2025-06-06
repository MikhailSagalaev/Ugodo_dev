"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"

type PreorderModalProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  quantity: number
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  onSuccess?: () => void
}

export default function PreorderModal({
  product,
  variant,
  quantity,
  isOpen,
  setIsOpen,
  onSuccess
}: PreorderModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон'
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный телефон'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Введите адрес'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // TODO: Отправка данных предзаказа на сервер
      console.log('Предзаказ:', {
        product: product.title,
        variant: variant?.id,
        quantity,
        customer: formData
      })

      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsOpen(false)
      if (onSuccess) {
        onSuccess()
      }

      // Очищаем форму
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: ''
      })
    } catch (error) {
      console.error('Ошибка отправки предзаказа:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                      <div className="flex flex-col">
                        <h2 className="text-black text-[35px] font-medium leading-tight uppercase">
                          ОФОРМЛЕНИЕ ПРЕДЗАКАЗА
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                          {product.title} {variant && `• ${variant.title}`} • {quantity} шт.
                        </p>
                      </div>

                      {/* Кнопка закрытия */}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Закрыть"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Содержимое */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                      <div className="space-y-6">
                        
                        {/* ФИО */}
                        <div>
                          <label 
                            className="block text-gray-500 uppercase mb-3"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              lineHeight: 1.5,
                              textTransform: "uppercase"
                            }}
                          >
                            ФИО *
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`w-full px-4 py-3 border transition-colors duration-200 ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300 focus:border-black'
                            } outline-none`}
                            placeholder="Введите ваше полное имя"
                          />
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label 
                            className="block text-gray-500 uppercase mb-3"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              lineHeight: 1.5,
                              textTransform: "uppercase"
                            }}
                          >
                            EMAIL *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-3 border transition-colors duration-200 ${
                              errors.email ? 'border-red-500' : 'border-gray-300 focus:border-black'
                            } outline-none`}
                            placeholder="example@email.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                          )}
                        </div>

                        {/* Телефон */}
                        <div>
                          <label 
                            className="block text-gray-500 uppercase mb-3"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              lineHeight: 1.5,
                              textTransform: "uppercase"
                            }}
                          >
                            ТЕЛЕФОН *
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-4 py-3 border transition-colors duration-200 ${
                              errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-black'
                            } outline-none`}
                            placeholder="+7 (999) 123-45-67"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                          )}
                        </div>

                        {/* Адрес */}
                        <div>
                          <label 
                            className="block text-gray-500 uppercase mb-3"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              lineHeight: 1.5,
                              textTransform: "uppercase"
                            }}
                          >
                            АДРЕС ДОСТАВКИ *
                          </label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className={`w-full px-4 py-3 border transition-colors duration-200 resize-none ${
                              errors.address ? 'border-red-500' : 'border-gray-300 focus:border-black'
                            } outline-none`}
                            placeholder="Введите полный адрес доставки"
                          />
                          {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                          )}
                        </div>

                        {/* Информация */}
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm text-gray-600">
                            После оформления предзаказа с вами свяжется наш менеджер для уточнения деталей и подтверждения заказа.
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="px-8 py-6 border-t border-gray-200">
                      <div className="flex gap-4">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 h-12 font-medium transition-colors duration-200 text-white"
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            letterSpacing: "1.4px",
                            textTransform: "uppercase",
                            backgroundColor: isSubmitting ? '#9CA3AF' : '#6290C3'
                          }}
                        >
                          {isSubmitting ? 'ОТПРАВКА...' : 'ОФОРМИТЬ ПРЕДЗАКАЗ'}
                        </button>

                        <button
                          onClick={() => setIsOpen(false)}
                          className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
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