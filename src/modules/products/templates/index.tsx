"use client";
import React, { Suspense, useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"

import ProductGallery from "@modules/products/components/product-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "@modules/products/components/product-reviews"
import Breadcrumbs, { BreadcrumbItem } from "@modules/common/components/breadcrumbs"
import ProductPrice from "@modules/products/components/product-price"
import { getSingleUnitVariant } from "@lib/util/get-single-unit-variant"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { getWishlist, addToWishlist, removeFromWishlist, retrieveCustomer } from "@lib/data/customer"
import SafeImage from "@modules/common/components/safe-image"
import ColorSelector from "@modules/common/components/color-selector"
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft } from 'lucide-react'
import ProductRating from "@modules/products/components/product-rating"
import QuantitySelector from "@modules/products/components/quantity-selector"
import { getProductReviews } from "@lib/data/reviews"
import CartNotification from "@modules/common/components/cart-notification"
import PreorderModal from "@modules/common/components/preorder-modal"
import SupportModal from "@modules/common/components/support-modal"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  console.log('Полный объект product:', product)
 
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("ОПИСАНИЕ");
  const params = useParams();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [visibleThumbStartIndex, setVisibleThumbStartIndex] = useState(0);
  
  const [customerLoaded, setCustomerLoaded] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [promoCodeCopied, setPromoCodeCopied] = useState(false);
  
  // Состояние для уведомления о добавлении в корзину
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
  
  // Состояние для расчета итоговой цены
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  // Функция для определения, нужно ли показывать QuantitySelector
  const shouldShowQuantitySelector = () => {
    // Теперь QuantitySelector не используется, опции показываются через renderOptionSelector
    return product.metadata?.bulk_discount === "true"
  }

  // Функция для расчета итоговой цены
  const calculateTotalPrice = () => {
    if (!selectedVariant) return null
    
    const hasQuantityOption = product.options?.some(option => 
      option.title?.toLowerCase().includes('количество')
    )
    
    if (hasQuantityOption) {
      // Если есть опция количества, цена = цена варианта × количество упаковок
      const variantPrice = selectedVariant.calculated_price?.calculated_amount || 0
      return variantPrice * quantity
    } else {
      // Если нет опции количества, используем обычную логику
      const variantPrice = selectedVariant.calculated_price?.calculated_amount || 0
      return variantPrice * quantity
    }
  }

  // Карусель для мобильной версии
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start'
  })

  // Синхронизация карусели с выбранным изображением
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedImageIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    async function fetchData() {
      if (customerLoaded) return;
      
      try {
        const customerData = await retrieveCustomer();
        setCustomer(customerData as any);
      } catch (error) {
        console.error("Ошибка загрузки данных клиента:", error);
        setCustomer(null);
      } finally {
        setCustomerLoaded(true);
      }
    }
    
    fetchData();
  }, [customerLoaded]);
  
  useEffect(() => {
    async function fetchWishlist() {
      if (!customer || wishlistLoaded) return;
      
      setIsLoadingWishlist(true);
      
      try {
        const items = await getWishlist();
        const item = items.find(i => i.product_id === product.id);
        if (item) {
          setIsInWishlist(true);
          setWishlistItemId(item.id);
        }
      } catch (error) {
        console.error("Ошибка загрузки избранного:", error);
      } finally {
        setIsLoadingWishlist(false);
        setWishlistLoaded(true);
      }
    }
    
    fetchWishlist();
  }, [customer, product.id, wishlistLoaded]);

  // Загружаем количество отзывов
  useEffect(() => {
    const loadReviewCount = async () => {
      try {
        const data = await getProductReviews({ productId: product.id, limit: 1 })
        setReviewCount(data.count || 0)
      } catch (error) {
        console.error('Ошибка загрузки количества отзывов:', error)
      }
    }

    loadReviewCount()
  }, [product.id])

  useEffect(() => {
    const quantities: Record<string, number> = {};
    product.variants?.forEach((variant) => {
      quantities[variant.id] = variant.inventory_quantity || 0;
    });
    setVariantQuantities(quantities);
  }, [product.id, product.variants])

  useEffect(() => {
    if (product.options && Object.keys(selectedOptions).length === 0) {
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
  }, [product, selectedOptions])

  const handlePromoCodeClick = async () => {
    try {
      await navigator.clipboard.writeText('ВМЕСТЕ')
      setPromoCodeCopied(true)
      setTimeout(() => setPromoCodeCopied(false), 2000)
    } catch (error) {
      console.error('Ошибка копирования промокода:', error)
    }
  }

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }))
  }

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
  const selectedVariantQuantity = selectedVariant ? variantQuantities[selectedVariant.id] : 0
  const isInStock = selectedVariantQuantity > 0

  useEffect(() => {
    if (selectedVariant && quantity > selectedVariantQuantity) {
      setQuantity(Math.min(quantity, selectedVariantQuantity > 0 ? selectedVariantQuantity : 1));
    }
  }, [selectedVariant?.id, selectedVariantQuantity]);

  useEffect(() => {
    const newTotalPrice = calculateTotalPrice()
    setTotalPrice(newTotalPrice)
  }, [selectedVariant?.id, quantity]);

  // Показываем количество товаров в консоли для отладки
  if (variantQuantities && Object.keys(variantQuantities).length > 0) {
    product.variants?.forEach((variant, index) => {
      const variantName = variant.title || `Вариант ${index + 1}`
      const quantity = variantQuantities[variant.id] || 0
      const stockStatus = quantity > 0 ? "В НАЛИЧИИ" : "НЕТ В НАЛИЧИИ"
    })
  }

  const scrollToImage = (index: number) => {
    const imageElement = document.getElementById(`modal-image-${index}`);
    if (imageElement) {
      imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedImageIndex(index);
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product || !product.id) {
    return notFound()
  }

  const breadcrumbItems: BreadcrumbItem[] = []
  
  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0]
    
    if (category.parent_category) {
      breadcrumbItems.push({
        name: category.parent_category.name,
        path: `/categories/${category.parent_category.handle}`
      })
    }
    
    breadcrumbItems.push({
      name: category.name,
      path: `/categories/${category.handle}`
    })
  } else if (product.collection) {
    breadcrumbItems.push({
      name: product.collection.title || "Категория",
      path: `/collections/${product.collection.handle}`
    })
  }
  
  breadcrumbItems.push({
    name: product.title,
    path: `/products/${product.handle}`
  })
  
  const productType = product.type?.value || ""
  const productTitle = product.title || ""
  const productSubtitle = product.subtitle || ""
  const variants = product.variants || []
  const isNew = product.metadata?.is_new === "true" || false
  const isHit = product.metadata?.is_hit === "true" || false
  const discountPercentage = product.metadata?.discount_percentage as string || null
  
  const articleNumber = product.metadata?.article as string || "99000048271"

  const tabContent: Record<string, string> = {
    "ОПИСАНИЕ": product.description || "Описание товара отсутствует.",
    "СОСТАВ": product.material || "Информация о составе отсутствует.",
    "БРЕНД": "UGODO",
    "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": product.subtitle || "Дополнительная информация отсутствует."
  };

  const productSpecs = (() => {
    const metadata = product.metadata || {}
    const specs = []
    
    // Добавляем стандартные поля продукта
    if (product.material && product.material.trim() !== "") {
      specs.push({ name: "Материал", value: product.material })
    }
    
    if (product.weight) {
      specs.push({ name: "Вес", value: `${product.weight} г` })
    }
    
    if (product.length || product.width || product.height) {
      const dimensions = []
      if (product.length) dimensions.push(`${product.length}`)
      if (product.width) dimensions.push(`${product.width}`)
      if (product.height) dimensions.push(`${product.height}`)
      specs.push({ name: "Размеры", value: `${dimensions.join(' × ')} мм` })
    }
    
    if (product.origin_country && product.origin_country.trim() !== "") {
      specs.push({ name: "Страна производства", value: product.origin_country })
    }
    
    // Добавляем метаданные, исключая служебные поля
    Object.entries(metadata).forEach(([key, value]) => {
      if (
        value && 
        value !== "" && 
        value !== "-" && 
        !key.startsWith("_")
      ) {
        const formattedKey = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, char => char.toUpperCase())
        specs.push({ name: formattedKey, value: String(value) })
      }
    })
    
    // Если нет характеристик, добавляем базовые из других полей
    if (specs.length === 0) {
      if (product.type?.value) {
        specs.push({ name: "Тип продукта", value: product.type.value })
      }
      if (product.categories && product.categories.length > 0) {
        specs.push({ name: "Категория", value: product.categories[0].name })
      }
      if (product.collection?.title) {
        specs.push({ name: "Коллекция", value: product.collection.title })
      }
    }
    
    return specs
  })()

  const nextImage = () => {
    if (product.images && selectedImageIndex < product.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (product.images) {
      setSelectedImageIndex(0);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (product.images) {
      setSelectedImageIndex(product.images.length - 1);
    }
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Предотвращаем проблемы с гидратацией
  if (!isClient) {
    return (
      <div className="pb-16">
        <div className="content-container">
          <div style={{ height: "600px" }} className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-500">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Функция для отображения всех опций как кнопки
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

    // Проверяем, является ли это опцией количества
    const isQuantityOption = option.title.toLowerCase().includes('количество')

    // Для всех остальных опций отображаем как кнопки
    const optionValues = new Set<string>()
    product.variants?.forEach(variant => {
      variant.options?.forEach(optionValue => {
        if (optionValue.option_id === option.id) {
          optionValues.add(optionValue.value)
        }
      })
    })

    // Сортируем значения для опции количества
    const sortedValues = Array.from(optionValues).sort((a, b) => {
      if (isQuantityOption) {
        return parseInt(a) - parseInt(b)
      }
      return a.localeCompare(b)
    })

    return (
      <div className="mb-6">
        <div className="text-gray-500 uppercase mb-3" style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "1.4px",
          lineHeight: 1.5,
          textTransform: "uppercase"
        }}>
          {option.title}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sortedValues.sort((a, b) => {
            if (isQuantityOption) {
              return parseInt(a) - parseInt(b)
            }
            return a.localeCompare(b)
          }).map((value) => {
            // Для опции количества показываем цену и скидку
            if (isQuantityOption) {
              const variant = product.variants?.find(v => 
                v.options?.some(opt => 
                  opt.option_id === option.id && opt.value === value
                )
              )
              const price = variant?.calculated_price?.calculated_amount || 0
              const quantity = parseInt(value)
              
              // Вычисляем скидку относительно цены за единицу самого маленького количества
              const baseVariant = product.variants?.find(v => 
                v.options?.some(opt => 
                  opt.option_id === option.id && opt.value === "1"
                )
              )
              const basePrice = baseVariant?.calculated_price?.calculated_amount || price
              const basePricePerUnit = basePrice
              const pricePerUnit = Math.round(price / quantity)
              
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
                    maxWidth: "120px"
                  }}
                >
                  {/* Плашка выгоды сверху */}
                  {discount > 0 && (
                    <div 
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-black text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap"
                      style={{ 
                        backgroundColor: '#BAFF29',
                        fontSize: "9px",
                        fontWeight: 600,
                        zIndex: 10
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

            // Для остальных опций обычные кнопки
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

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    // Для товаров в наличии проверяем количество
    if (isInStock && quantity > selectedVariantQuantity) return;
    
    setIsAddingToCart(true);
    try {
      if (isInStock) {
        // Обычное добавление в корзину
        await addToCart({
          variantId: selectedVariant.id,
          quantity: quantity,
          countryCode: params.countryCode as string,
        });
        
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        setAddSuccess(true);
        setShowCartNotification(true);
        
        setTimeout(() => {
          setAddSuccess(false);
        }, 2000);
      } else {
        // Открываем модалку предзаказа
        setIsPreorderModalOpen(true);
        return;
      }
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!customer) return;
    
    setIsLoadingWishlist(true);
    
    try {
      if (isInWishlist && wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
        setIsInWishlist(false);
        setWishlistItemId(null);
      } else {
        await addToWishlist(product.id);
        const items = await getWishlist();
        const item = items.find(i => i.product_id === product.id);
        if (item) {
          setIsInWishlist(true);
          setWishlistItemId(item.id);
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении избранного:", error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const scrollThumbnailsUp = () => {
    if (visibleThumbStartIndex > 0) {
      setVisibleThumbStartIndex(visibleThumbStartIndex - 1);
    }
  };
  
  const scrollThumbnailsDown = () => {
    if (product.images && visibleThumbStartIndex < product.images.length - 4) {
      setVisibleThumbStartIndex(visibleThumbStartIndex + 1);
    }
  };

  return (
    <div className={`pb-16 ${isMobile ? 'pb-20' : ''}`}>
      {/* Уведомление о добавлении в корзину */}
      <CartNotification
        product={product}
        variant={selectedVariant || undefined}
        quantity={quantity}
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
      />

      {isMobile ? (
        <div>
          <div className="flex items-center justify-between mb-4 pt-2 px-4">
            <div className="flex items-center">
              <ChevronLeft size={16} className="mr-2" />
              <nav aria-label="Breadcrumbs" className="flex items-center text-[14px] text-black">
                {breadcrumbItems.length > 0 ? (
                  <span className="text-black">{breadcrumbItems[breadcrumbItems.length - 1].name}</span>
                ) : (
                  <span className="text-black">товар</span>
                )}
              </nav>
            </div>
            
            <div className="flex items-center">
              <ProductRating productId={product.id} showCount={true} size="lg" />
            </div>
          </div>

          <div className="mb-2 px-4">
            {productType && (
              <div className="uppercase"
                  style={{
                    fontSize: "9px",
                    fontWeight: 500,
                    letterSpacing: "1.4px",
                    lineHeight: 1.5,
                    textTransform: "uppercase"
                  }}>
                {productType}
              </div>
            )}
          </div>

          <h1 className="mb-6 px-4" style={{
            fontSize: "20px",
            fontWeight: 500,
            letterSpacing: "-0.4px",
            lineHeight: 1.1,
            textTransform: "uppercase"
          }}>
            {productTitle}
            {productSubtitle && (
              <div style={{
                fontSize: "20px",
                fontWeight: 500,
                letterSpacing: "-0.4px",
                lineHeight: 1.1,
                textTransform: "lowercase"
              }}>
                {productSubtitle}
              </div>
            )}
          </h1>

          <div className="mb-6 relative">
            <div className="relative">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                {isNew && (
                  <div className="inline-flex px-2 py-1 bg-[#BAFF29] text-black text-xs font-bold uppercase">
                    NEW
                  </div>
                )}
                {isHit && (
                  <div className="inline-flex px-2 py-1 bg-red-500 text-white text-xs font-bold uppercase">
                    HIT
                  </div>
                )}
                {discountPercentage && (
                  <div className="inline-flex px-2 py-1 bg-[#FF3998] text-white text-xs font-bold uppercase">
                    -{discountPercentage}%
                  </div>
                )}
                {!isInStock && (
                  <div className="inline-flex px-2 py-1 text-white text-xs font-bold uppercase" style={{ backgroundColor: '#6290C3' }}>
                    ПРЕДЗАКАЗ
                  </div>
                )}
              </div>
              
              <div className="relative w-full overflow-hidden" style={{ height: "533px" }} ref={emblaRef}>
                <div className="flex h-full">
                  {product.images?.map((image, index) => (
                    <div key={image.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                      <div onClick={openImageModal} className="cursor-pointer w-full h-full">
                        <Image
                          src={image.url}
                          alt={`Product image ${index + 1}`}
                          fill
                          priority={index === 0}
                          sizes="100vw"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-1">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-200 
                        ${index === selectedImageIndex 
                          ? 'bg-black' 
                          : 'bg-gray-400 hover:bg-gray-600'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 px-4">
            <div className="font-medium" style={{
              fontSize: "25px",
              fontWeight: 500,
              letterSpacing: "-0.4px",
              lineHeight: 1.2
            }}>
              <ProductPrice 
                product={product} 
                region={region} 
                variant={selectedVariant || undefined}
                quantity={quantity}
                showTotalPrice={true}
              />
            </div>
          </div>

          <div className="mb-6 px-4">
            {shouldShowQuantitySelector() ? (
              <QuantitySelector
                product={product}
                region={region}
                onQuantityChange={(newQuantity, newPrice) => {
                  setQuantity(newQuantity)
                }}
                selectedQuantity={quantity}
              />
            ) : (
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-500 uppercase" style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "1.4px",
                  lineHeight: 1.5,
                  textTransform: "uppercase"
                }}>
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
                    max={selectedVariantQuantity > 0 ? selectedVariantQuantity : 1}
                    value={quantity} 
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      setQuantity(newQuantity);
                    }}
                    onBlur={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      const maxQuantity = selectedVariantQuantity > 0 ? selectedVariantQuantity : 1;
                      setQuantity(Math.min(Math.max(newQuantity, 1), maxQuantity));
                    }}
                    disabled={!isInStock}
                    className="w-full h-full text-center outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Отображение всех опций товара */}
            {product.options?.map((option) => (
              <div key={option.id}>
                {renderOptionSelector(option)}
              </div>
            ))}
            
            <div 
              className="flex items-center mb-6 group cursor-pointer"
              onClick={handlePromoCodeClick}
            >
              <div 
                className="bg-[#BAFF29] flex items-center justify-center relative" 
                style={{ 
                  width: "118px", 
                  height: "26px",
                  clipPath: "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)"
                }}
              >
                <span 
                  className="text-black transition-colors duration-200 group-hover:text-[#C2E7DA]"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    lineHeight: "12.1px"
                  }}
                >
                  ВМЕСТЕ | -25%
                </span>
              </div>
              <span 
                className="ml-2 text-black transition-colors duration-200 group-hover:text-[#C2E7DA]"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.1,
                  fontWeight: 400,
                  fontStyle: "italic"
                }}
              >
                {promoCodeCopied ? 'скопировано' : 'по промокоду'}
              </span>
              <svg className="ml-2 w-4 h-4 transition-colors duration-200 group-hover:stroke-[#C2E7DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            {!customer && (
              <div className="flex items-center mb-6 transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer" style={{ fontSize: "14px" }}>
                <div className="rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center mr-2">
                  <span style={{ fontSize: "12px", fontWeight: "bold" }}>i</span>
                </div>
                <LocalizedClientLink href="/account/login" className="font-medium hover:no-underline">авторизуйся</LocalizedClientLink>
                <span className="ml-1">и получай бонусы</span>
              </div>
            )}
          </div>

          {/* Аккордион для мобильной версии */}
          <div className="space-y-4 mb-8 px-4">
            {Object.entries(tabContent).map(([tab, content]) => (
              <div key={tab} className="border-b border-gray-200">
                <button
                  onClick={() => setSelectedTab(selectedTab === tab ? "" : tab)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className={`font-medium uppercase text-sm ${selectedTab === tab ? 'border-b border-black pb-1' : ''}`}>{tab}</span>
                  <div className="w-5 h-5 flex items-center justify-center">
                    {selectedTab === tab ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
                      </svg>
                    )}
                  </div>
                </button>
                {selectedTab === tab && (
                  <div className="pb-4">
                    {tab === "ОПИСАНИЕ" ? (
                      <>
                        <h3 className="mb-4" style={{ fontSize: "16px", fontWeight: 500, textTransform: "uppercase" }}>
                          {productTitle}
                        </h3>
                        <div className="text-sm mb-4">
                          <p className="mb-2" style={{ fontSize: "14px", color: "#7f7f7f" }}>SKU: {(product.variants && product.variants[0]?.sku) || product.handle || product.id}</p>
                        </div>
                        {content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} style={{ fontSize: "14px" }} className="mb-4">
                            {paragraph}
                          </p>
                        ))}
                        
                        {productSpecs.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-sm mb-4 font-medium lowercase">
                              подробные характеристики
                            </h3>
                            <div className="space-y-3">
                              {productSpecs.map((spec, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-start pb-2 gap-1 sm:gap-0">
                                  <div className="text-gray-500 text-sm sm:flex-shrink-0 sm:min-w-0 break-words sm:w-1/3">
                                    {spec.name}
                                  </div>
                                  <div className="hidden sm:block flex-1 mx-2 border-b border-dotted border-gray-300 mt-2"></div>
                                  <div className="text-sm break-words sm:flex-shrink-0 sm:min-w-0 sm:text-right sm:w-1/3">
                                    {spec.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize: "14px" }}>{content}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Блоки гарантий для мобильной версии */}
          <div className="flex items-center justify-center mb-8 px-4">
            <div className="flex items-center cursor-pointer" onClick={() => setIsSupportModalOpen(true)}>
              <div className="w-[80px] h-[80px] mr-4">
                <Image
                  src="/images/logo/logo3.png"
                  alt="Логотип"
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="flex flex-col">
                <div className="text-[#7f7f7f] text-xs font-normal">
                  нужна помощь?
                </div>
                <div className="font-normal text-base">
                  служба поддержки
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-xs">
                <div className="font-semibold">Гарантия качества</div>
                <div>продукции</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">₽</span>
              </div>
              <div className="text-xs">
                <div className="font-semibold">Бесплатная доставка от</div>
                <div>1500 ₽</div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">RU</span>
              </div>
              <div className="text-xs">
                <div className="font-semibold">Доставка по всей</div>
                <div>территории РФ</div>
              </div>
            </div>
          </div>
        </div>
      ) : isTablet ? (
        // ПЛАНШЕТНАЯ ВЕРСИЯ (768px - 1024px)
        <div>
          <div className="flex items-center justify-between mb-4 pt-2 px-6">
            <div className="flex items-center">
              <ChevronLeft size={16} className="mr-2" />
              <nav aria-label="Breadcrumbs" className="flex items-center text-[14px] text-black">
                {breadcrumbItems.length > 0 ? (
                  <span className="text-black">{breadcrumbItems[breadcrumbItems.length - 1].name}</span>
                ) : (
                  <span className="text-black">товар</span>
                )}
              </nav>
            </div>
            
            <div className="flex items-center">
              <ProductRating productId={product.id} showCount={true} size="lg" />
            </div>
          </div>

          <div className="flex px-6 gap-8">
            {/* Левая часть - изображения */}
            <div className="w-1/2">
              <div className="mb-2">
                {productType && (
                  <div className="uppercase"
                      style={{
                        fontSize: "9px",
                        fontWeight: 500,
                        letterSpacing: "1.4px",
                        lineHeight: 1.5,
                        textTransform: "uppercase"
                      }}>
                    {productType}
                  </div>
                )}
              </div>

              <h1 className="mb-6" style={{
                fontSize: "28px",
                fontWeight: 500,
                letterSpacing: "-0.4px",
                lineHeight: 1.1,
                textTransform: "uppercase"
              }}>
                {productTitle}
                {productSubtitle && (
                  <div style={{
                    fontSize: "28px",
                    fontWeight: 500,
                    letterSpacing: "-0.4px",
                    lineHeight: 1.1,
                    textTransform: "lowercase"
                  }}>
                    {productSubtitle}
                  </div>
                )}
              </h1>

              <div className="mb-6 relative">
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    {isNew && (
                      <div className="inline-flex px-2 py-1 bg-[#BAFF29] text-black text-xs font-bold uppercase">
                        NEW
                      </div>
                    )}
                    {isHit && (
                      <div className="inline-flex px-2 py-1 bg-red-500 text-white text-xs font-bold uppercase">
                        HIT
                      </div>
                    )}
                    {discountPercentage && (
                      <div className="inline-flex px-2 py-1 bg-[#FF3998] text-white text-xs font-bold uppercase">
                        -{discountPercentage}%
                      </div>
                    )}
                    {!isInStock && (
                      <div className="inline-flex px-2 py-1 text-white text-xs font-bold uppercase" style={{ backgroundColor: '#6290C3' }}>
                        ПРЕДЗАКАЗ
                      </div>
                    )}
                  </div>
                  
                  <div className="relative w-full aspect-[3/4] overflow-hidden" ref={emblaRef}>
                    <div className="flex h-full">
                      {product.images?.map((image, index) => (
                        <div key={image.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                          <div onClick={openImageModal} className="cursor-pointer w-full h-full">
                            <Image
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              fill
                              priority={index === 0}
                              sizes="50vw"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {product.images && product.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex gap-1">
                      {product.images.map((_, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-200 
                            ${index === selectedImageIndex 
                              ? 'bg-black' 
                              : 'bg-gray-400 hover:bg-gray-600'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Правая часть - информация о товаре */}
            <div className="w-1/2">
              <div className="mb-6">
                <div className="font-medium" style={{
                  fontSize: "32px",
                  fontWeight: 500,
                  letterSpacing: "-0.4px",
                  lineHeight: 1.2
                }}>
                  <ProductPrice 
                    product={product} 
                    region={region} 
                    variant={selectedVariant || undefined}
                    quantity={quantity}
                    showTotalPrice={true}
                  />
                </div>
              </div>

              <div className="mb-6">
                {shouldShowQuantitySelector() ? (
                  <QuantitySelector
                    product={product}
                    region={region}
                    onQuantityChange={(newQuantity, newPrice) => {
                      setQuantity(newQuantity)
                    }}
                    selectedQuantity={quantity}
                  />
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-500 uppercase" style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "1.4px",
                      lineHeight: 1.5,
                      textTransform: "uppercase"
                    }}>
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
                        max={selectedVariantQuantity > 0 ? selectedVariantQuantity : 1}
                        value={quantity} 
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          setQuantity(newQuantity);
                        }}
                        onBlur={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          const maxQuantity = selectedVariantQuantity > 0 ? selectedVariantQuantity : 1;
                          setQuantity(Math.min(Math.max(newQuantity, 1), maxQuantity));
                        }}
                        disabled={!isInStock}
                        className="w-full h-full text-center outline-none disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Отображение всех опций товара */}
              {product.options?.map((option) => (
                <div key={option.id}>
                  {renderOptionSelector(option)}
                </div>
              ))}

              <div 
                className="flex items-center mb-6 group cursor-pointer"
                onClick={handlePromoCodeClick}
              >
                <div 
                  className="bg-[#BAFF29] flex items-center justify-center relative" 
                  style={{ 
                    width: "118px", 
                    height: "26px",
                    clipPath: "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)"
                  }}
                >
                  <span 
                    className="text-black transition-colors duration-200 group-hover:text-[#C2E7DA]"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      lineHeight: "12.1px"
                    }}
                  >
                    ВМЕСТЕ | -25%
                  </span>
                </div>
                <span 
                  className="ml-2 text-black transition-colors duration-200 group-hover:text-[#C2E7DA]"
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.1,
                    fontWeight: 400,
                    fontStyle: "italic"
                  }}
                >
                  {promoCodeCopied ? 'скопировано' : 'по промокоду'}
                </span>
                <svg className="ml-2 w-4 h-4 transition-colors duration-200 group-hover:stroke-[#C2E7DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {!customer && (
                <div className="flex items-center mb-6 transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer" style={{ fontSize: "14px" }}>
                  <div className="rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center mr-2">
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>i</span>
                  </div>
                  <LocalizedClientLink href="/account/login" className="font-medium hover:no-underline">авторизуйся</LocalizedClientLink>
                  <span className="ml-1">и получай бонусы</span>
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (isInStock && quantity > selectedVariantQuantity)}
                  className={`flex-1 h-12 font-medium transition-colors duration-200 ${
                    isAddingToCart || (isInStock && quantity > selectedVariantQuantity)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addSuccess
                      ? 'bg-green-500 text-white'
                      : !isInStock
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "1.4px",
                    textTransform: "uppercase"
                  }}
                >
                  {isAddingToCart ? (isInStock ? 'ДОБАВЛЕНИЕ...' : 'ОФОРМЛЕНИЕ...') : addSuccess ? (isInStock ? 'ДОБАВЛЕНО!' : 'ПРЕДЗАКАЗ ОФОРМЛЕН!') : !isInStock ? 'СДЕЛАТЬ ПРЕДЗАКАЗ' : quantity > selectedVariantQuantity ? 'ПРЕВЫШЕН ЛИМИТ' : 'В КОРЗИНУ'}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={isLoadingWishlist || !customer}
                  className="w-12 h-12 border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill={isInWishlist ? "red" : "none"} 
                    stroke={isInWishlist ? "red" : "currentColor"}
                    strokeWidth="1.5"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Аккордеон для планшетной версии */}
              <div className="space-y-4">
                {Object.entries(tabContent).map(([tab, content]) => (
                  <div key={tab} className="border-b border-gray-200">
                    <button
                      onClick={() => setSelectedTab(selectedTab === tab ? "" : tab)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className={`font-medium uppercase text-sm ${selectedTab === tab ? 'border-b border-black pb-1' : ''}`}>{tab}</span>
                      <div className="w-5 h-5 flex items-center justify-center">
                        {selectedTab === tab ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
                          </svg>
                        )}
                      </div>
                    </button>
                    
                    {selectedTab === tab && (
                      <div className="pb-4">
                        {tab === "ОПИСАНИЕ" ? (
                          <div>
                            <h3 className="mb-4" style={{ fontSize: "16px", fontWeight: 500, textTransform: "uppercase" }}>
                              {productTitle}
                            </h3>
                            <div className="text-sm mb-4">
                              <p className="mb-2" style={{ fontSize: "14px", color: "#7f7f7f" }}>SKU: {(product.variants && product.variants[0]?.sku) || product.handle || product.id}</p>
                            </div>
                            {content.split('\\n\\n').map((paragraph, idx) => (
                              <p key={idx} style={{ fontSize: "14px" }} className="mb-4">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "14px" }}>{content}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Блоки гарантий для планшетной версии */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">Гарантия качества</div>
                    <div>продукции</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold">₽</span>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">Бесплатная доставка от</div>
                    <div>1500 ₽</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold">RU</span>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">Доставка по всей</div>
                    <div>территории РФ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ДЕСКТОПНАЯ ВЕРСИЯ (оригинальная)
        <>
          <div className="content-container flex items-start mb-4">
            <div className="flex w-1/2 items-center self-center justify-start">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
            
            <div className="flex flex-col w-1/2" style={{ paddingLeft: "20px" }}>
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {reviewCount > 0 && (
                    <>
                      <ProductRating productId={product.id} showCount={false} size="lg" />
                      <span className="mx-2">•</span>
                      <span className="text-sm">{reviewCount} отзывов</span>
                    </>
                  )}
                </div>
              </div>
                
              <div className="flex items-center mb-2">
                {productType && (
                  <div className="uppercase"
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "1.4px",
                        lineHeight: 1.5,
                        textTransform: "uppercase"
                      }}>
                    {productType}
                  </div>
                )}
              </div>
                
              <h1 className="text-3xl small:text-5xl font-medium leading-tight tracking-tight"
                  style={{
                    fontSize: "50px",
                    fontWeight: 500,
                    letterSpacing: "-0.2px",
                    lineHeight: 1.1
                  }}>
                {productTitle}
                {productSubtitle && (
                  <div className="text-3xl small:text-5xl font-medium leading-tight tracking-tight"
                      style={{
                        fontSize: "50px",
                        fontWeight: 500,
                        letterSpacing: "-0.2px",
                        lineHeight: 1.1,
                        textTransform: "lowercase"
                      }}>
                    {productSubtitle}
                  </div>
                )}
              </h1>
            </div>
          </div>
          
          <div className="content-container flex justify-center">
            <div className="flex relative">
              {product.images && product.images.length > 1 && (
                <div className="absolute top-1/2 transform -translate-y-1/2" style={{ right: "calc(100% + 60px)" }}>
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={scrollThumbnailsUp}
                      className="mb-2 focus:outline-none"
                      disabled={visibleThumbStartIndex === 0}
                    >
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: visibleThumbStartIndex === 0 ? '#CCCCCC' : '#000000' }}
                      >
                        <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <div className="flex flex-col gap-2">
                      {product.images
                        .slice(visibleThumbStartIndex, visibleThumbStartIndex + 4)
                        .map((image, index) => {
                          const actualIndex = index + visibleThumbStartIndex;
                          return (
                            <div
                              key={image.id}
                              onClick={() => {
                                setSelectedImageIndex(actualIndex);
                              }}
                              className={`relative cursor-pointer my-2 transition-all duration-200 ${selectedImageIndex === actualIndex ? 'opacity-100 ring-2 ring-black' : 'opacity-50 hover:opacity-75'}`}
                              style={{ width: "70px", height: "70px" }}
                            >
                              <Image
                                src={image.url}
                                alt={`Thumbnail ${actualIndex + 1}`}
                                fill
                                sizes="70px"
                                style={{ objectFit: "contain" }}
                                className="absolute inset-0"
                              />
                            </div>
                          );
                        })}
                    </div>
                    
                    <button 
                      onClick={scrollThumbnailsDown}
                      className="mt-2 focus:outline-none"
                      disabled={!product.images || visibleThumbStartIndex >= product.images.length - 4}
                    >
                      <svg 
                        width="15" 
                        height="15" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: !product.images || visibleThumbStartIndex >= product.images.length - 4 ? '#CCCCCC' : '#000000' }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              <div className="relative flex flex-col">
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    {isNew && (
                      <div className="inline-flex px-2 py-1 bg-[#BAFF29] text-black text-xs font-bold uppercase">
                        NEW
                      </div>
                    )}
                    {isHit && (
                      <div className="inline-flex px-2 py-1 bg-red-500 text-white text-xs font-bold uppercase">
                        HIT
                      </div>
                    )}
                    {discountPercentage && (
                      <div className="inline-flex px-2 py-1 bg-[#FF3998] text-white text-xs font-bold uppercase">
                        -{discountPercentage}%
                      </div>
                    )}
                    {!isInStock && (
                      <div className="inline-flex px-2 py-1 text-white text-xs font-bold uppercase" style={{ backgroundColor: '#6290C3' }}>
                        ПРЕДЗАКАЗ
                      </div>
                    )}
                  </div>
                  
                  <div style={{ width: "632px", height: "843px", position: "relative" }} className="group">
                    {product.images && product.images.length > 0 && (
                      <Image
                        key={`main-image-${selectedImageIndex}`}
                        src={product.images[selectedImageIndex].url}
                        alt={`Product image ${selectedImageIndex + 1}`}
                        fill
                        priority
                        sizes="632px"
                        style={{ objectFit: "contain" }}
                      />
                    )}
                    
                    {product.images && product.images.length > 1 && (
                      <>
                        <div
                          onClick={prevImage}
                          className="absolute left-0 top-0 w-1/4 h-full z-10"
                          style={{ cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"black\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 18l-6-6 6-6\"/></svg>') 12 12, auto" }}
                        />
                        
                        <div
                          onClick={nextImage}
                          className="absolute right-0 top-0 w-1/4 h-full z-10"
                          style={{ cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"black\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 18l6-6-6-6\"/></svg>') 12 12, auto" }}
                        />
                      </>
                    )}
                    
                    <div
                      onClick={openImageModal}
                      className="absolute left-1/4 top-0 w-1/2 h-full z-10 cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex mt-8 gap-10">
                  <div className="flex items-center p-3" style={{ width: "190px", height: "40px" }}>
                    <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold">Гарантия качества</div>
                      <div>продукции</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3" style={{ width: "190px", height: "40px" }}>
                    <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                      <span className="font-bold">₽</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold">Бесплатная доставка от</div>
                      <div>1500 ₽</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3" style={{ width: "190px", height: "40px" }}>
                    <div className="w-8 h-8 border border-black rounded-full flex items-center justify-center mr-3">
                      <span className="font-bold">RU</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold">Доставка по всей</div>
                      <div>территории РФ</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: "60px 90px 0" }}>
                <div className="w-[400px]">
                  <div className="mb-6">
                    {shouldShowQuantitySelector() ? (
                      <QuantitySelector
                        product={product}
                        region={region}
                        onQuantityChange={(newQuantity, newPrice) => {
                          setQuantity(newQuantity)
                        }}
                        selectedQuantity={quantity}
                      />
                    ) : (
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-500 uppercase" style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          letterSpacing: "1.4px",
                          lineHeight: 1.5,
                          textTransform: "uppercase"
                        }}>
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
                            max={selectedVariantQuantity > 0 ? selectedVariantQuantity : 1}
                            value={quantity} 
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              setQuantity(newQuantity);
                            }}
                            onBlur={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              const maxQuantity = selectedVariantQuantity > 0 ? selectedVariantQuantity : 1;
                              setQuantity(Math.min(Math.max(newQuantity, 1), maxQuantity));
                            }}
                            disabled={!isInStock}
                            className="w-full h-full text-center outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Отображение всех опций товара */}
                  {product.options?.map((option) => (
                    <div key={option.id}>
                      {renderOptionSelector(option)}
                    </div>
                  ))}
                  
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
                  
                  <div 
                    className="flex items-center mb-6 group cursor-pointer"
                    onClick={handlePromoCodeClick}
                  >
                    <div 
                      className="bg-[#BAFF29] flex items-center justify-center relative" 
                      style={{ 
                        width: "118px", 
                        height: "26px",
                        clipPath: "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)"
                      }}
                    >
                      <span 
                        className="text-black transition-colors duration-200 group-hover:text-[#C2E7DA]"
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          lineHeight: "12.1px"
                        }}
                      >
                        ВМЕСТЕ | -25%
                      </span>
                    </div>
                    <span 
                      className="ml-2 text-black transition-colors duration-200 group-hover:text-[#C2E7DA]"
                      style={{
                        fontSize: "14px",
                        lineHeight: 1.1,
                        fontWeight: 400,
                        fontStyle: "italic"
                      }}
                    >
                      {promoCodeCopied ? 'скопировано' : 'по промокоду'}
                    </span>
                    <svg className="ml-2 w-4 h-4 transition-colors duration-200 group-hover:stroke-[#C2E7DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  {!customer && (
                    <div className="flex items-center mb-6 transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer" style={{ fontSize: "14px" }}>
                      <div className="rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center mr-2">
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>i</span>
                      </div>
                      <LocalizedClientLink href="/account/login" className="font-medium hover:no-underline">авторизуйся</LocalizedClientLink>
                      <span className="ml-1">и получай бонусы</span>
                    </div>
                  )}
                  
                  <div className="flex mb-6 gap-2">
                    <button 
                      className={`${addSuccess ? 'bg-[#C2E7DA]' : !isInStock ? 'bg-cyan-600 hover:bg-cyan-700' : isInStock && quantity <= selectedVariantQuantity ? 'bg-black hover:bg-[#C2E7DA] hover:text-black' : 'bg-gray-400 cursor-not-allowed'} text-white uppercase font-medium transition-colors duration-200`}
                      style={{
                        width: "305px",
                        height: "50px",
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "1.4px",
                        lineHeight: 1.5,
                        textTransform: "uppercase"
                      }}
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || (isInStock && quantity > selectedVariantQuantity)}
                    >
                      {isAddingToCart ? (isInStock ? 'Добавление...' : 'Оформление...') : addSuccess ? (isInStock ? 'Добавлено ✓' : 'Предзаказ оформлен ✓') : !isInStock ? 'Сделать предзаказ' : quantity > selectedVariantQuantity ? 'Превышен лимит' : 'Добавить в корзину'}
                    </button>
                    <button 
                      className="bg-black border border-gray-300 flex items-center justify-center transition-colors duration-200 hover:bg-[#C2E7DA]"
                      style={{
                        width: "55px",
                        height: "50px"
                      }}
                      onClick={handleWishlistToggle}
                      disabled={isLoadingWishlist || !customer}
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill={isInWishlist ? "white" : "none"} 
                        stroke="white"
                        className="transition-colors duration-200 hover:stroke-black"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden">
            <div></div>
          </div>
        </>
      )}

      {/* Остальной контент одинаковый для всех версий */}
      <div className={`content-container my-8 ${isMobile ? 'px-4' : ''}`}>
        {!isMobile && (
          <div className="mx-auto" style={{ maxWidth: "760px" }}>
            <div className="my-8">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {Object.keys(tabContent).map(tab => (
                  <button 
                    key={tab} 
                    className={`py-4 px-6 font-medium ${selectedTab === tab ? 'border-b-2 border-black' : 'text-gray-500'}`}
                    onClick={() => setSelectedTab(tab)}
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "1.4px",
                      lineHeight: 1.5,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      position: "relative"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="py-8">
                {selectedTab === "ОПИСАНИЕ" ? (
                  <>
                    <h3 className="mb-6" style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: 1.4,
                      textTransform: "uppercase"
                    }}>
                      {productTitle}
                    </h3>
                    <div className="text-sm mb-6" style={{ fontSize: "16px", lineHeight: 1.5 }}>
                      <p className="mb-2" style={{ fontSize: "14px", color: "#7f7f7f" }}>SKU: {(product.variants && product.variants[0]?.sku) || product.handle || product.id}</p>
                    </div>
                    {tabContent[selectedTab].split('\n\n').map((paragraph, idx) => (
                      <p key={idx} style={{ fontSize: "14px" }} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </>
                ) : (
                  <p style={{ fontSize: "14px" }}>{tabContent[selectedTab]}</p>
                )}
              </div>
            </div>
            
            {productSpecs.length > 0 && (
              <div className="my-8">
                <h2 className="text-lg mb-6" style={{
                  fontWeight: 500,
                  lineHeight: 1.5,
                  textTransform: "lowercase",
                  fontSize: "16px"
                }}>
                  подробные характеристики
                </h2>
                <div className="grid grid-cols-1 gap-y-4">
                  {productSpecs.map((spec, index) => (
                    <div key={index} className="flex items-center pb-2">
                      <div className="text-gray-500 flex-shrink-0" style={{
                        color: "#7f7f7f",
                        fontSize: "14px",
                        lineHeight: 1.4
                      }}>
                        {spec.name}
                      </div>
                      <div className="flex-1 mx-4 border-b border-dotted border-gray-300"></div>
                      <div className="flex-shrink-0" style={{
                        fontSize: "14px",
                        lineHeight: 1.4
                      }}>
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-center items-center my-4">
              <div className="flex items-center cursor-pointer" onClick={() => setIsSupportModalOpen(true)}>
                <div className="w-[106px] h-[106px] mr-4">
                  <Image
                    src="/images/logo/logo3.png"
                    alt="Логотип"
                    width={106}
                    height={106}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className="flex flex-col">
                  <div 
                    className="text-[#7f7f7f]"
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      lineHeight: 1.1
                    }}
                  >
                    нужна помощь?
                  </div>
                  <div 
                    className="font-medium"
                    style={{
                      fontSize: "18px",
                      fontWeight: 400
                    }}
                  >
                    служба поддержки
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={`content-container my-8 ${isMobile ? 'px-4' : ''}`} style={{ marginTop: "40px" }}>
        <ProductReviews productId={product.id} product={product} />
      </div>
      
      <div className={`content-container my-8 ${isMobile ? 'px-4' : ''}`}>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} title="похожие товары" />
        </Suspense>
      </div>
      
      <div className={`content-container my-8 ${isMobile ? 'px-4' : ''}`}>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} title="вам может понравиться" showAllProducts={true} />
        </Suspense>
      </div>

      {/* Модальные окна */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
          <div className="relative bg-white flex-shrink-0" style={{ height: isMobile ? "120px" : "200px" }}>
            <div className={`absolute ${isMobile ? 'top-4 left-4' : 'top-8 left-1/2 transform -translate-x-1/2 translate-x-10'} px-4 py-2`}>
              <div className="uppercase mb-2" style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "1.4px",
                lineHeight: 1.5,
                textTransform: "uppercase"
              }}>
                {productType}
              </div>
              <h1 className="text-3xl font-medium" style={{
                fontSize: isMobile ? "20px" : "50px",
                fontWeight: 500,
                letterSpacing: "-0.2px",
                lineHeight: 1.1
              }}>
                {productTitle}
                {productSubtitle && (
                  <div className="text-3xl font-medium" style={{
                    fontSize: isMobile ? "20px" : "50px",
                    fontWeight: 500,
                    letterSpacing: "-0.2px",
                    lineHeight: 1.1,
                    textTransform: "lowercase"
                  }}>
                    {productSubtitle}
                  </div>
                )}
              </h1>
            </div>
            
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {!isMobile && product.images && product.images.length > 1 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" style={{ width: "120px" }}>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={scrollThumbnailsUp}
                    className="mb-2 focus:outline-none"
                    disabled={visibleThumbStartIndex === 0}
                  >
                    <svg 
                      width="15" 
                      height="15" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: visibleThumbStartIndex === 0 ? '#CCCCCC' : '#000000' }}
                    >
                      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className="flex flex-col gap-2">
                    {product.images
                      ?.slice(visibleThumbStartIndex, visibleThumbStartIndex + 4)
                      .map((image, index) => {
                        const actualIndex = index + visibleThumbStartIndex;
                        return (
                          <div
                            key={image.id}
                            onClick={() => scrollToImage(actualIndex)}
                            className={`relative cursor-pointer transition-all duration-200 ${selectedImageIndex === actualIndex ? 'opacity-100 ring-2 ring-black' : 'opacity-50 hover:opacity-75'}`}
                            style={{ width: "80px", height: "80px" }}
                          >
                            <Image
                              src={image.url}
                              alt={`Thumbnail ${actualIndex + 1}`}
                              fill
                              sizes="80px"
                              style={{ objectFit: "cover" }}
                              className="absolute inset-0"
                            />
                          </div>
                        );
                      })}
                  </div>
                  
                  <button 
                    onClick={scrollThumbnailsDown}
                    className="mt-2 focus:outline-none"
                    disabled={!product.images || visibleThumbStartIndex >= product.images.length - 4}
                  >
                    <svg 
                      width="15" 
                      height="15" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: !product.images || visibleThumbStartIndex >= product.images.length - 4 ? '#CCCCCC' : '#000000' }}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="h-full overflow-y-auto" style={{ paddingLeft: isMobile ? "0" : "140px" }}>
              {product.images?.map((image, index) => (
                <div key={image.id} id={`modal-image-${index}`} className={`flex items-center justify-center ${isMobile ? 'p-2' : 'p-8'}`}>
                  <div className="relative" style={{ 
                    width: isMobile ? "100%" : "1530px", 
                    height: isMobile ? "auto" : "1040px", 
                    aspectRatio: isMobile ? "3/4" : undefined,
                    maxWidth: isMobile ? "100%" : "90vw", 
                    maxHeight: "90vh" 
                  }}>
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      sizes={isMobile ? "100vw" : "1530px"}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <SupportModal 
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex gap-2">
            <button 
              className={`flex-1 ${addSuccess ? 'bg-[#C2E7DA]' : !isInStock ? 'bg-cyan-600 hover:bg-cyan-700' : isInStock && quantity <= selectedVariantQuantity ? 'bg-black hover:bg-[#C2E7DA] hover:text-black' : 'bg-gray-400 cursor-not-allowed'} text-white uppercase font-medium transition-colors duration-200`}
              style={{
                height: "50px",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "1.4px",
                lineHeight: 1.5,
                textTransform: "uppercase"
              }}
              onClick={handleAddToCart}
              disabled={isAddingToCart || (isInStock && quantity > selectedVariantQuantity)}
            >
              {isAddingToCart ? (isInStock ? 'Добавление...' : 'Оформление...') : addSuccess ? (isInStock ? 'Добавлено ✓' : 'Предзаказ оформлен ✓') : !isInStock ? 'Сделать предзаказ' : quantity > selectedVariantQuantity ? 'Превышен лимит' : 'Добавить в корзину'}
            </button>
            <button 
              className="bg-black border border-gray-300 flex items-center justify-center transition-colors duration-200 hover:bg-[#C2E7DA]"
              style={{
                width: "55px",
                height: "50px"
              }}
              onClick={handleWishlistToggle}
              disabled={isLoadingWishlist || !customer}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill={isInWishlist ? "white" : "none"} 
                stroke="white"
                className="transition-colors duration-200 hover:stroke-black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Модалка предзаказа */}
      <PreorderModal
        product={product}
        variant={selectedVariant || undefined}
        quantity={quantity}
        isOpen={isPreorderModalOpen}
        setIsOpen={setIsPreorderModalOpen}
        onSuccess={() => {
          setAddSuccess(true);
          setShowCartNotification(true);
          setTimeout(() => {
            setAddSuccess(false);
          }, 2000);
        }}
      />
    </div>
  )
}

export default ProductTemplate