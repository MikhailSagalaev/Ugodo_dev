"use client"

import { HttpTypes } from "@medusajs/types"
import { Region } from "@medusajs/medusa"
import { Button, clx } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import { addToCart } from "@lib/data/cart"
// Закомментируем импорт, так как компонент не найден
// import MobileDrawer from "@modules/mobile-menu/components/mobile-drawer" 
import OptionSelect from "@modules/products/components/product-actions/option-select"
import ProductPrice from "@modules/products/components/product-price"

// Типы пропсов теперь включают variant и информацию о пользователе/избранном
type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion | Region
  variant?: HttpTypes.StoreProductVariant
  // Добавляем недостающие пропсы
  options: Record<string, string | undefined> // Добавим options
  updateOptions: (optionId: string, value: string) => void // Добавим updateOptions
  inStock: boolean // Добавим inStock
  handleAddToCart: () => Promise<void> // Добавим handleAddToCart
  isAdding: boolean // Добавим isAdding
  show: boolean // Добавим show
  optionsDisabled: boolean // Добавим optionsDisabled
  customer: HttpTypes.StoreCustomer | null
  isLoadingCustomer: boolean
  isInWishlist: boolean
  isLoadingWishlist: boolean
  handleWishlistToggle: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  region,
  variant,
  // Добавляем новые пропсы в деструктуризацию
  options: passedOptions,
  updateOptions,
  inStock,
  handleAddToCart: passedHandleAddToCart,
  isAdding: passedIsAdding,
  show,
  optionsDisabled,
  customer,
  isLoadingCustomer,
  isInWishlist,
  isLoadingWishlist,
  handleWishlistToggle,
}) => {
  // Используем локальное состояние для опций, если они не переданы напрямую
  // или если нужно управлять ими независимо в мобильной версии.
  // Если хотите, чтобы опции синхронизировались, используйте passedOptions и updateOptions напрямую.
  const [options, setOptions] = useState<Record<string, string | undefined>>(passedOptions || {}); 
  // Локальное состояние isAdding, если нужно управлять им независимо
  const [isAdding, setIsAdding] = useState(passedIsAdding || false);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const countryCode = useParams().countryCode as string
  const variants = product.variants ?? []
  const drawerRef = useRef<HTMLButtonElement>(null)
  
  // Синхронизируем локальные опции, если пропсы изменились
  useEffect(() => {
     setOptions(passedOptions || {});
  }, [passedOptions]);
  
  // Синхронизируем локальное isAdding
   useEffect(() => {
     setIsAdding(passedIsAdding || false);
  }, [passedIsAdding]);


  // Выбранный вариант на основе ЛОКАЛЬНЫХ опций
  const selectedVariant = useMemo(() => {
    if (variant) return variant

    let variantRecord: Record<string, Record<string, string>> = {}

    for (const variant of variants) {
      if (!variant.options || !variant.id) continue

      const temp: Record<string, string> = {}
      for (const option of variant.options) {
        if (option.option_id) {
          temp[option.option_id] = option.value
        }
      }
      variantRecord[variant.id] = temp
    }

    for (const key in variantRecord) {
      const currentOptions = Object.entries(options)
        .filter(([, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
      if (isEqual(variantRecord[key], currentOptions)) {
        return variants.find((v) => v.id === key)
      }
    }

    return undefined
  }, [options, variants])

  // Локальная функция добавления в корзину
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode: countryCode,
    })
    setIsAdding(false)
    // Закрываем шторку после добавления
    setIsDrawerOpen(false)
  }
  
   // Обновление локальных опций
  const updateLocalOptions = (optionId: string, value: string) => {
    setOptions((prev) => ({ ...prev, [optionId]: value }));
    // Если нужно прокидывать изменения наверх, вызываем updateOptions
    // updateOptions(optionId, value); 
  };

  // Используем переданный проп `show` для условного рендеринга
  if (!show) {
    return null;
  }

  return (
    <>
      <div
        className={clx("sticky inset-x-0 bottom-0 flex flex-col gap-y-3 bg-ui-bg-base p-4 shadow-elevation-modal lg:hidden", {
          // Убираем useIntersection, т.к. используем проп `show`
        })}
        data-testid="mobile-actions"
      >
        {/* Закомментируем MobileDrawer, т.к. он не найден */}
        {/* <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} ref={drawerRef}> */}
          {/* <MobileDrawer.Trigger asChild> */}
            <Button 
                variant="primary" // Используем primary, т.к. это основное действие на мобилке
                className="w-full" 
                data-testid="mobile-actions-button"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
               {selectedVariant ? "Изменить опции" : "Выберите опции"}
            </Button>
          {/* </MobileDrawer.Trigger> */}
          {/* <MobileDrawer.Content data-testid="mobile-actions-content"> */}
          {isDrawerOpen && (
            // Обертка для содержимого шторки
            <div 
                className="fixed inset-0 z-50 bg-black/50 flex items-end" 
                onClick={() => setIsDrawerOpen(false)} // Закрытие по клику на фон
            >
                <div 
                    className="bg-white w-full max-h-[80vh] overflow-y-auto rounded-t-lg p-4 flex flex-col gap-y-4"
                    onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику внутри
                 >
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-medium">{product.title}</h3>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-gray-500">&times;</button>
                    </div>

                    {/* Цена (использует selectedVariant, выбранный на основе локальных опций) */}
                    {product && region && (
                      <ProductPrice product={product} variant={selectedVariant} region={region} />
                    )}
    
                    {/* Опции */}
                    {(variants.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-4">
                          {(product.options || []).map((option) => {
                          return (
                              <div key={option.id}>
                                <OptionSelect
                                  option={option}
                                  current={options[option.id]} // Используем локальные options
                                  updateOption={updateLocalOptions} // Используем локальную функцию
                                  title={option.title}
                                  data-testid="mobile-option-select"
                                  // Используем переданный optionsDisabled
                                  disabled={optionsDisabled}
                                />
                              </div>
                          )
                          })}
                      </div>
                    )}
    
                    {/* Кнопка Добавить/Нет в наличии (использует локальный isAdding) */}
                    <Button
                      onClick={handleAddToCart} // Используем локальную функцию
                      // Используем переданный inStock, локальный selectedVariant и локальный isAdding
                      disabled={!inStock || !selectedVariant || isAdding}
                      variant="primary"
                      className="w-full h-10 mt-auto" // mt-auto прижимает кнопку к низу
                      isLoading={isAdding} // Используем локальный isAdding
                      data-testid="mobile-add-to-cart-button"
                    >
                    {!inStock
                        ? "Нет в наличии"
                        : !selectedVariant
                        ? "Выберите вариант"
                        : "Добавить в корзину"}
                    </Button>
                </div>
            </div>
          )}
          {/* </MobileDrawer.Content> */}
        {/* </MobileDrawer> */}
      </div>
    </>
  )
}

export default MobileActions 