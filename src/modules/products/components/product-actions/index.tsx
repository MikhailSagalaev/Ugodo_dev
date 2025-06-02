"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import React, { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { Heart } from "lucide-react"
import { getWishlist, addToWishlist, removeFromWishlist, retrieveCustomer } from "@lib/data/customer"
import CartNotification from "@modules/common/components/cart-notification"
// import { StoreCustomer } from "../../../../types/medusa" // <-- Убираем некорректный импорт

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  onAddToCartSuccess?: () => void
}

function optionsAsKeymap(options: HttpTypes.StoreProductVariant["options"]) {
  if (!options) return {}
  return options.reduce((acc, option) => {
    if (option.option_id && option.value) {
      acc[option.option_id] = option.value
    }
    return acc
  }, {} as Record<string, string>)
}

export default function ProductActions({
  product,
  region,
  disabled,
  onAddToCartSuccess,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string
  const [customer, setCustomer] = React.useState<HttpTypes.StoreCustomer | null>(null)
  const [isInWishlist, setIsInWishlist] = React.useState(false)
  const [wishlistItemId, setWishlistItemId] = React.useState<string | null>(null)
  const [isLoadingWishlist, setIsLoadingWishlist] = React.useState(false)
  const [isLoadingCustomer, setIsLoadingCustomer] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [showCartNotification, setShowCartNotification] = useState(false)

  // Инициализация опций только один раз при монтировании
  useEffect(() => {
    if (!isInitialized && product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
      setIsInitialized(true)
    } else if (!isInitialized) {
      setIsInitialized(true)
    }
  }, [product.variants, isInitialized])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const availableOptionValues = useMemo(() => {
    const available: Record<string, string[]> = {};
    
    if (!product.variants || product.variants.length === 0) {
      product.options?.forEach(opt => available[opt.id] = []);
      return available;
    }

    product.options?.forEach(option => {
      const optionId = option.id;
      const possibleValues = option.values?.map(v => v.value) || [];
      const availableValuesForOption: string[] = [];

      possibleValues.forEach(value => {
        const testOptions = { ...options, [optionId]: value };

        const variantExists = product.variants?.some(variant => {
          const variantOptions = optionsAsKeymap(variant.options);
          const cleanTestOptions = Object.entries(testOptions).reduce((acc, [key, val]) => {
              if (val !== undefined) acc[key] = val;
              return acc;
          }, {} as Record<string, string>);
          
          return isEqual(variantOptions, cleanTestOptions);
        });

        if (variantExists) {
          availableValuesForOption.push(value);
        }
      });
      available[optionId] = availableValuesForOption;
    });

    return available;
  }, [product.options, product.variants, options]);

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant?.allow_backorder) {
      return true
    }

    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    window.dispatchEvent(new CustomEvent('cartUpdated'))
    setShowCartNotification(true)

    setIsAdding(false)
    if (typeof onAddToCartSuccess === 'function') {
      onAddToCartSuccess()
    }
  }

  // Загрузка данных пользователя
  React.useEffect(() => {
    let isMounted = true
    
    const loadCustomer = async () => {
      try {
        const customerData = await retrieveCustomer()
        if (isMounted) {
          setCustomer(customerData as any)
        }
      } catch (error) {
        if (isMounted) {
          setCustomer(null)
        }
      } finally {
        if (isMounted) {
          setIsLoadingCustomer(false)
        }
      }
    }
    
    loadCustomer()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Загрузка избранного
  React.useEffect(() => {
    let isMounted = true
    
    if (customer && !isLoadingCustomer) {
      setIsLoadingWishlist(true)
      getWishlist()
        .then(items => {
          if (isMounted) {
            const item = items.find(i => i.product_id === product.id)
            if (item) {
              setIsInWishlist(true)
              setWishlistItemId(item.id)
            } else {
              setIsInWishlist(false)
              setWishlistItemId(null)
            }
          }
        })
        .catch(err => {
          console.error("Ошибка загрузки избранного на странице товара:", err)
          if (isMounted) {
            setIsInWishlist(false)
            setWishlistItemId(null)
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingWishlist(false)
          }
        })
    } else if (!customer && !isLoadingCustomer && isMounted) {
      setIsInWishlist(false)
      setWishlistItemId(null)
    }
    
    return () => {
      isMounted = false
    }
  }, [customer, product.id, isLoadingCustomer])

  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!customer) {
      console.log("Пользователь не авторизован")
      return
    }

    setIsLoadingWishlist(true)
    let success = false

    if (isInWishlist && wishlistItemId) {
      success = await removeFromWishlist(wishlistItemId)
      if (success) {
        setIsInWishlist(false)
        setWishlistItemId(null)
      }
    } else {
      success = await addToWishlist(product.id)
      if (success) {
        getWishlist().then(items => {
          const item = items.find(i => i.product_id === product.id)
          if (item) {
            setIsInWishlist(true)
            setWishlistItemId(item.id)
          }
        })
      }
    }
    setIsLoadingWishlist(false)
    if (!success) {
      console.error("Не удалось обновить избранное")
    }
  }

  return (
    <>
      {/* Уведомление о добавлении в корзину */}
      <CartNotification
        product={product}
        variant={selectedVariant}
        quantity={1}
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
      />

      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {product.variants && product.variants.length > 1 && (
          <div className="flex flex-col gap-y-4">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title}
                    data-testid="option-select"
                    disabled={!!disabled}
                  />
                </div>
              )
            })}
          </div>
        )}

        <ProductPrice product={product} variant={selectedVariant} region={region} />

        <div className="flex w-full gap-2 mb-6">
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="flex-1 h-12 bg-black !text-white text-sm uppercase font-medium"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? "Выберите вариант"
              : !inStock || !isValidVariant
              ? "Нет в наличии"
              : "Добавить в корзину"}
          </Button>
          
          <Button
            variant="secondary"
            className={`w-16 h-12 !px-2 border border-gray-300 relative ${isLoadingCustomer || !customer || isLoadingWishlist ? 'cursor-wait' : ''}`}
            onClick={handleWishlistToggle}
            disabled={isLoadingCustomer || !customer || isLoadingWishlist}
            aria-label={isInWishlist ? "Удалить из избранного" : "Добавить в избранное"}
            title={!customer ? "Войдите, чтобы добавить в избранное" : (isInWishlist ? "Удалить из избранного" : "Добавить в избранное")}
          >
            <Heart 
              className={`transition-all ${isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`}
            />
            {(isLoadingWishlist || isLoadingCustomer) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            )}
          </Button>
        </div>

        {/* Наличие в магазинах */}
        <div className="flex items-center justify-center">
          <a href="#" className="flex items-center text-sm font-medium">
            <span>Наличие в магазинах</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
              <path d="M9 18l6-6-6-6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Мобильные действия */}
        <MobileActions
          product={product}
          variant={selectedVariant}
          region={region}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isLoadingCustomer}
          customer={customer}
          isLoadingCustomer={isLoadingCustomer}
          isInWishlist={isInWishlist}
          isLoadingWishlist={isLoadingWishlist}
          handleWishlistToggle={handleWishlistToggle}
        />
      </div>
    </>
  )
}
