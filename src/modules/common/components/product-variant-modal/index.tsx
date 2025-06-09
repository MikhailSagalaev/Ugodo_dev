"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { getSingleUnitVariant } from "@lib/util/get-single-unit-variant"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { Button } from "@medusajs/ui"
import PreorderModal from "@modules/common/components/preorder-modal"
import ColorSelector from "@modules/common/components/color-selector"
import ProductPrice from "@modules/products/components/product-price"

type ProductVariantModalProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  isOpen: boolean
  setIsOpen: (state: boolean) => void
  onAddToCartSuccess?: () => void
}

export default function ProductVariantModal({
  product,
  region,
  isOpen,
  setIsOpen,
  onAddToCartSuccess
}: ProductVariantModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWished, setIsWished] = useState(false)
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false)
  
  useEffect(() => {
    if (isOpen && product.options) {
      const singleUnitVariant = getSingleUnitVariant(product);
      if (singleUnitVariant) {
        const initialOptions: Record<string, string> = {};
        singleUnitVariant.options?.forEach(optionValue => {
          if (optionValue.option_id) {
            initialOptions[optionValue.option_id] = optionValue.value;
          }
        });
        setSelectedOptions(initialOptions);
      }
    }
  }, [isOpen, product])
  
  const params = useParams()

  const { cheapestPrice } = getProductPrice({
    product: product,
    region: region,
  })

  const getSelectedVariant = () => {
    if (!product.variants || product.variants.length === 0) return null
    
    if (!product.options || product.options.length === 0) {
      return product.variants[0]
    }
    
    return product.variants.find(variant => {
      return variant.options?.every(optionValue => {
        const selectedValue = selectedOptions[optionValue.option_id || '']
        return !selectedValue || selectedValue === optionValue.value
      })
    }) || product.variants[0]
  }

  const selectedVariant = getSelectedVariant()
  const isInStock = Boolean(selectedVariant && (selectedVariant.inventory_quantity || 0) > 0)
  const isOutOfStock = !isInStock

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

  useEffect(() => {
    if (selectedVariant && quantity > (selectedVariant.inventory_quantity || 0)) {
      setQuantity(Math.min(quantity, selectedVariant.inventory_quantity || 1))
    }
  }, [selectedVariant?.id, selectedVariant?.inventory_quantity])

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }))
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    
    if (isInStock) {
      const maxQuantity = selectedVariant.inventory_quantity || 0
      if (quantity > maxQuantity) return
    }

    setIsAddingToCart(true)
    try {
      if (isInStock) {
        await addToCart({
          variantId: selectedVariant.id,
          quantity: quantity,
          countryCode: params.countryCode as string,
        })
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        setIsOpen(false)
        setIsPreorderModalOpen(true)
        return
      }

      setIsOpen(false)
      if (onAddToCartSuccess) {
        onAddToCartSuccess()
      }
    } catch (error) {
      console.error("Ошибка:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const toggleWishlist = () => {
    setIsWished(!isWished)
  }

  const renderOptionSelector = (option: HttpTypes.StoreProductOption) => {
    const isColorOption = option.title.toLowerCase().includes('цвет') || 
                         option.title.toLowerCase().includes('color')

    if (isColorOption) {
      return (
        <ColorSelector 
          product={product}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
        />
      )
    }

    const optionValues = new Set<string>()
    product.variants?.forEach(variant => {
      variant.options?.forEach(optionValue => {
        if (optionValue.option_id === option.id) {
          optionValues.add(optionValue.value)
        }
      })
    })

    return (
      <div className="mb-6" style={{ overflow: "visible" }}>
        <div 
          className="text-gray-500 uppercase mb-3"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "1.4px",
            lineHeight: 1.5,
            textTransform: "uppercase"
          }}
        >
          {option.title}
        </div>
        <div className="flex gap-2 flex-wrap pt-4" style={{ overflow: "visible", position: "relative" }}>
          {Array.from(optionValues).sort((a, b) => {
            const isQuantityOption = option.title?.toLowerCase().includes('количество')
            if (isQuantityOption) {
              return parseInt(a) - parseInt(b)
            }
            return a.localeCompare(b)
          }).map((value) => {
            const isQuantityOption = option.title?.toLowerCase().includes('количество')
            
            if (isQuantityOption) {
              const quantity = parseInt(value) || 1
              
              const variantForOption = product.variants?.find(variant => 
                variant.options?.some(opt => 
                  opt.option_id === option.id && opt.value === value
                )
              )
              
              const price = variantForOption?.calculated_price?.calculated_amount || 0
              
              const baseVariant = product.variants?.find(variant => 
                variant.options?.some(opt => 
                  opt.option_id === option.id && opt.value === "1"
                )
              )
              const basePrice = baseVariant?.calculated_price?.calculated_amount || price
              const basePricePerUnit = basePrice
              const pricePerUnit = price / quantity
              
              let discount = 0
              if (basePricePerUnit > 0 && pricePerUnit < basePricePerUnit) {
                discount = Math.round(((basePricePerUnit - pricePerUnit) / basePricePerUnit) * 100)
              }

              const formatPrice = (price: number) => {
                return new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: region.currency_code?.toUpperCase() || 'RUB',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(price)
              }

              return (
                <button
                  key={value}
                  onClick={() => handleOptionChange(option.id, value)}
                  className={`relative border-2 rounded-lg transition-all duration-200 text-center flex-shrink-0 ${
                    selectedOptions[option.id] === value
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ 
                    minHeight: "80px",
                    minWidth: "100px",
                    maxWidth: "120px",
                    position: "relative",
                    overflow: "visible"
                  }}
                >
                  {discount > 0 && (
                    <div 
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-black text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap"
                      style={{ 
                        backgroundColor: '#BAFF29',
                        fontSize: "9px",
                        fontWeight: 600,
                        zIndex: 50
                      }}
                    >
                      ВЫГОДА {discount}%
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center justify-center h-full p-3 pt-6">
                    <div className="text-base font-bold mb-0.5">
                      {value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPrice(Math.round(price / quantity))} / шт
                    </div>
                  </div>
                </button>
              )
            }

            return (
              <button
                key={value}
                onClick={() => handleOptionChange(option.id, value)}
                className={`px-4 py-2 border transition-colors duration-200 ${
                  selectedOptions[option.id] === value
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-black'
                }`}
                style={{ fontSize: "14px" }}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
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
                        {/* Тип товара */}
                        {product.type?.value && (
                          <div className="text-gray-500 mb-2 text-[11px] font-medium tracking-widest uppercase leading-tight">
                            {product.type.value}
                          </div>
                        )}
                        
                        {/* Название товара */}
                        <LocalizedClientLink href={`/products/${product.handle}`}>
                          <h2 className="text-black cursor-pointer hover:text-[#C2E7DA] transition-colors text-[35px] font-medium leading-tight uppercase"
                            onClick={() => setIsOpen(false)}
                          >
                            {product.title}
                            {product.subtitle && (
                              <div className="text-[35px] font-medium leading-tight lowercase">
                                {product.subtitle}
                              </div>
                            )}
                          </h2>
                        </LocalizedClientLink>
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
                    <div className="flex-1" style={{ paddingTop: "10px", overflowY: "auto", overflowX: "visible" }}>
                      {/* Картинка товара */}
                      <div className="w-full">
                        {product.images?.[0] && (
                          <div className="relative w-full h-96">
                            <Image
                              src={product.images[0].url}
                              alt={product.title || "Product"}
                              fill
                              className="object-contain"
                              sizes="765px"
                            />
                          </div>
                        )}
                      </div>

                      {/* Информация о товаре */}
                      <div className="px-8 py-6" style={{ paddingTop: "30px", overflow: "visible", position: "relative" }}>
                        
                        {/* Опции товара */}
                        {product.options?.map((option) => (
                          <div key={option.id}>
                            {renderOptionSelector(option)}
                          </div>
                        ))}

                        {/* Количество */}
                        <div className="flex items-center justify-between mb-6">
                          <div 
                            className="text-gray-500 uppercase"
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              lineHeight: 1.5,
                              textTransform: "uppercase"
                            }}
                          >
                            {(() => {
                              const hasQuantityOption = product.options?.some(option => 
                                option.title?.toLowerCase().includes('количество')
                              )
                              return hasQuantityOption ? "КОЛИЧЕСТВО УПАКОВОК" : "КОЛИЧЕСТВО"
                            })()}
                          </div>
                          <div className="inline-flex items-center justify-center border border-gray-300 w-16 h-10">
                            <input 
                              type="number" 
                              min="1" 
                              max={selectedVariant?.inventory_quantity || 1}
                              value={quantity} 
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1
                                setQuantity(newQuantity)
                              }}
                              onBlur={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1
                                const maxQuantity = selectedVariant?.inventory_quantity || 1
                                setQuantity(Math.min(Math.max(newQuantity, 1), maxQuantity))
                              }}
                              disabled={!isInStock}
                              className="w-full h-full text-center outline-none disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <div 
                            className="font-medium"
                            style={{ fontSize: "30px" }}
                          >
                            <ProductPrice 
                              product={product} 
                              region={region} 
                              variant={selectedVariant || undefined}
                              quantity={quantity}
                              showTotalPrice={true}
                            />
                          </div>
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-4 mb-6">
                          <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || (isInStock && quantity > (selectedVariant?.inventory_quantity || 0))}
                            className={`flex-1 h-12 font-medium transition-colors duration-200 ${
                              isAddingToCart || (isInStock && quantity > (selectedVariant?.inventory_quantity || 0))
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : !isInStock 
                                  ? 'text-white'
                                  : 'bg-black text-white hover:bg-gray-800'
                            }`}
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              textTransform: "uppercase",
                              ...(isOutOfStock ? { backgroundColor: '#6290C3' } : {})
                            }}
                          >
                            {isAddingToCart ? (isInStock ? 'ДОБАВЛЕНИЕ...' : 'ОФОРМЛЕНИЕ...') : 
                             !isInStock ? 'СДЕЛАТЬ ПРЕДЗАКАЗ' : 
                             quantity > (selectedVariant?.inventory_quantity || 0) ? 'ПРЕВЫШЕН ЛИМИТ' : 
                             'В КОРЗИНУ'}
                          </button>

                          <button
                            onClick={toggleWishlist}
                            className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                          >
                            <svg 
                              width="20" 
                              height="20" 
                              viewBox="0 0 24 24" 
                              fill={isWished ? "red" : "none"} 
                              stroke={isWished ? "red" : "currentColor"}
                              strokeWidth="1.5"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                        </div>

                        {/* Артикул */}
                        <div className="mb-4">
                          <div className="text-sm text-gray-500">
                            SKU: {selectedVariant?.sku || product.handle || product.id}
                          </div>
                        </div>

                        {/* Описание */}
                        <div className="mb-6">
                          <div className="text-sm text-gray-700 line-clamp-3">
                            {product.description || "Описание товара отсутствует."}
                          </div>
                        </div>

                        {/* Кнопка подробнее */}
                        <LocalizedClientLink href={`/products/${product.handle}`}>
                          <Button 
                            className="w-full h-12 bg-white border border-black text-black hover:bg-black hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              letterSpacing: "1.4px",
                              textTransform: "uppercase"
                            }}
                          >
                            подробнее о продукте
                          </Button>
                        </LocalizedClientLink>
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

    {/* Модалка предзаказа */}
    <PreorderModal
      product={product}
      variant={selectedVariant || undefined}
      quantity={quantity}
      isOpen={isPreorderModalOpen}
      setIsOpen={setIsPreorderModalOpen}
      onSuccess={() => {
        if (onAddToCartSuccess) {
          onAddToCartSuccess()
        }
      }}
    />
  </>
  )
} 