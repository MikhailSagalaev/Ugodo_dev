import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"
import { Heart } from "lucide-react"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  region: HttpTypes.StoreRegion
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
  customer?: HttpTypes.StoreCustomer | null
  isLoadingCustomer?: boolean
  isInWishlist?: boolean
  isLoadingWishlist?: boolean
  handleWishlistToggle?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  region,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
  customer,
  isLoadingCustomer,
  isInWishlist,
  isLoadingWishlist,
  handleWishlistToggle
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
    region: region,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-white flex flex-col gap-y-3 justify-center items-center text-large-regular p-4 h-full w-full border-t border-gray-200"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2">
              <span data-testid="mobile-title">{product.title}</span>
              <span>—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2 text-ui-fg-base">
                  {selectedPrice.price_type === "sale" && (
                    <p>
                      <span className="line-through-blue text-small-regular">
                        {selectedPrice.original_price}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx({
                      "text-ui-fg-interactive":
                        selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex w-full gap-x-2">
              {!isSimple && (
                <Button
                  onClick={open}
                  variant="secondary"
                  className="flex-1"
                  data-testid="mobile-actions-button"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>
                      {variant
                        ? Object.values(options).join(" / ")
                        : "Выбрать опции"}
                    </span>
                    <ChevronDown />
                  </div>
                </Button>
              )}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                className="flex-1 bg-black !text-white uppercase font-medium"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? "Выбрать вариант"
                  : !inStock
                  ? "Нет в наличии"
                  : "Добавить в корзину"}
              </Button>
              
              {handleWishlistToggle && (
                <Button
                  variant="secondary"
                  className={`w-12 !px-0 border border-gray-300 relative ${isLoadingCustomer || !customer || isLoadingWishlist ? 'cursor-wait' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={isLoadingCustomer || !customer || isLoadingWishlist}
                  aria-label={isInWishlist ? "Удалить из избранного" : "Добавить в избранное"}
                  title={!customer ? "Войдите, чтобы добавить в избранное" : (isInWishlist ? "Удалить из избранного" : "Добавить в избранное")}
                >
                  <Heart 
                    className={`transition-all ${isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`}
                    size={20}
                  />
                  {(isLoadingWishlist || isLoadingCustomer) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-white w-12 h-12 rounded-full text-ui-fg-base flex justify-center items-center"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-white px-6 py-12">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
