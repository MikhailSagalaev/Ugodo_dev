"use client";
import React, { Suspense, useState, useEffect } from "react"

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
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
      setIsMobile(window.innerWidth < 768);
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

  const handleAddToCart = async () => {
    if (!product.variants || product.variants.length === 0) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart({
        variantId: product.variants[0].id,
        quantity: quantity,
        countryCode: params.countryCode as string,
      });
      setAddSuccess(true);
      
      setTimeout(() => {
        setAddSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
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

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

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

  console.log("Product structure:", {
    id: product.id,
    title: product.title,
    categories: product.categories
  })

  const breadcrumbItems: BreadcrumbItem[] = []
  
  if (product.collection) {
    breadcrumbItems.push({
      name: product.collection.title || "Категория",
      path: `/collections/${product.collection.handle}`
    })
  }
  
  const productCategory = "Shirts"
  const productTitle = product.title || ""
  const productSubtitle = product.subtitle || ""
  const variants = product.variants || []
  const isNew = product.metadata?.is_new === "true" || false
  const isHit = product.metadata?.is_hit === "true" || false
  const discountPercentage = product.metadata?.discount_percentage as string || null
  
  const articleNumber = product.metadata?.article as string || "99000048271"

  const tabContent: Record<string, string> = {
    "ОПИСАНИЕ": product.description || "Пудра обогащена витаминами, регулирует работу сальных желез, способствует увлажнению и питанию изнутри. Этот продукт для лица поможет решить проблемы с воспалениями, избытком себума, забиванием пор, а также поможет уменьшить появление акне и сделает следы постакне менее заметными. Регулярное использование этого продукта позволит достичь ровного тонуса кожи и естественного сияния.\n\nНежная пудра для умывания мягко удаляет омертвевшие клетки, не вызывая шелушения. Умывалка для лица бережно и эффективно очистит кожу от загрязнений и остатков макияжа. Этот уход активизирует процесс обновления кожных клеток, борется со старением, помогает разгладить морщины и неровности, а также уменьшает пигментацию.\n\nСпециальный комплекс активных компонентов в составе пудры смягчает и матирует кожный покров, делая его чистым, свежим и привлекательным. Наш пилинг порошок подходит для жирной, нормальной, проблемной и чувствительной кожи.",
    "СОСТАВ": product.metadata?.composition as string || "состава пока нет",
    "БРЕНД": product.metadata?.brand_info as string || "бренд угодо",
    "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": product.metadata?.additional_info as string || "пока нет"
  };

  const productSpecs = (() => {
    const metadata = product.metadata || {};
    const specs = [];
    
    // Добавляем все метаданные, исключая служебные поля
    Object.entries(metadata).forEach(([key, value]) => {
      if (
        value && 
        value !== "" && 
        value !== "-" && 
        !key.startsWith("_") && 
        !["discount_percentage", "is_new", "is_hit", "article", "composition", "brand_info", "additional_info"].includes(key)
      ) {
        const formattedKey = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, char => char.toUpperCase());
        specs.push({ name: formattedKey, value: String(value) });
      }
    });
    
    // Если нет метаданных, добавляем базовые характеристики
    if (specs.length === 0) {
      if (product.type?.value) {
        specs.push({ name: "Тип продукта", value: product.type.value });
      }
      if (product.categories && product.categories.length > 0) {
        specs.push({ name: "Категория", value: product.categories[0].name });
      }
      if (product.weight) {
        specs.push({ name: "Вес", value: `${product.weight} г` });
      }
      if (product.material) {
        specs.push({ name: "Материал", value: product.material });
      }
      if (product.origin_country) {
        specs.push({ name: "Страна производства", value: product.origin_country });
      }
    }
    
    return specs;
  })();

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

  return (
    <div className={`pb-16 ${isMobile ? 'pb-20' : ''}`}>
      {isMobile ? (
        <div>
          <div className="flex items-center justify-between mb-4 pt-2 px-4">
            <div className="flex items-center">
              <ChevronLeft size={16} className="mr-2" />
              <nav aria-label="Breadcrumbs" className="flex items-center text-[14px] text-black">
                <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors duration-200">
                  главная
                </LocalizedClientLink>
                {breadcrumbItems.map((item, index) => (
                  <span key={index} className="flex items-center">
                    <span className="mx-1">/</span>
                    {index === breadcrumbItems.length - 1 ? (
                      <span className="text-black">{item.name}</span>
                    ) : (
                      <LocalizedClientLink 
                        href={item.path} 
                        className="hover:text-gray-800 transition-colors duration-200"
                      >
                        {item.name}
                      </LocalizedClientLink>
                    )}
                  </span>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center">
              <ProductRating productId={product.id} showCount={true} size="lg" />
            </div>
          </div>

          <div className="mb-2 px-4">
            <div className="uppercase text-[#7f7f7f]" style={{
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "1.4px",
              lineHeight: 1.5,
              textTransform: "uppercase"
            }}>
              {productCategory}
            </div>
          </div>

          <h1 className="mb-6 px-4" style={{
            fontSize: "30px",
            fontWeight: 500,
            letterSpacing: "-0.4px",
            lineHeight: 1.1,
            textTransform: "uppercase"
          }}>
            {productTitle}
            {productSubtitle && (
              <div style={{
                fontSize: "30px",
                fontWeight: 500,
                letterSpacing: "-0.4px",
                lineHeight: 1.1,
                textTransform: "uppercase"
              }}>
                {productSubtitle}
              </div>
            )}
          </h1>

          <div className="mb-6 relative">
            <div className="relative">
              {isNew && (
                <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-[#BAFF29] text-black text-xs font-bold uppercase">
                  NEW
                </div>
              )}
              {isHit && !isNew && (
                <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-red-500 text-white text-xs font-bold uppercase">
                  HIT
                </div>
              )}
              {!isNew && !isHit && discountPercentage && (
                <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-[#FF3998] text-white text-xs font-bold uppercase">
                  -{discountPercentage}%
                </div>
              )}
              
              <div className="relative w-full overflow-hidden" style={{ height: "400px" }} ref={emblaRef}>
                <div className="flex h-full">
                  {product.images?.map((image, index) => (
                    <div key={image.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                      <div onClick={openImageModal} className="cursor-pointer w-full h-full">
                        <SafeImage
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
                        emblaApi?.scrollTo(index);
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
                variant={product.variants?.[0]}
              />
            </div>
          </div>

          <div className="mb-6 px-4">
            {product.metadata?.bulk_discount === "true" ? (
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
                  КОЛИЧЕСТВО / ШТ
                </div>
                <div className="inline-flex items-center justify-center border border-gray-300 w-16 h-10">
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full h-full text-center outline-none"
                  />
                </div>
              </div>
            )}

            {product.options?.some(option => 
              option.title.toLowerCase().includes('цвет') || 
              option.title.toLowerCase().includes('color')
            ) && (
              <div className="mb-6">
                <ColorSelector 
                  product={product}
                  selectedOptions={selectedOptions}
                  onOptionChange={handleOptionChange}
                />
              </div>
            )}
            
            <div className="flex items-center mb-6 group cursor-pointer justify-center">
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
                по промокоду
              </span>
              <svg className="ml-2 w-4 h-4 transition-colors duration-200 group-hover:stroke-[#C2E7DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex items-center mb-6 transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer justify-center" style={{ fontSize: "14px" }}>
              <div className="rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center mr-2">
                <span style={{ fontSize: "12px", fontWeight: "bold" }}>i</span>
              </div>
              <LocalizedClientLink href="/account/login" className="font-medium hover:no-underline">авторизуйся</LocalizedClientLink>
              <span className="ml-1">и получай бонусы</span>
            </div>
          </div>

          {/* Аккордион для мобильной версии */}
          <div className="space-y-4 mb-8 px-4">
            {Object.entries(tabContent).map(([tab, content]) => (
              <div key={tab} className="border-b border-gray-200">
                <button
                  onClick={() => setSelectedTab(selectedTab === tab ? "" : tab)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="font-medium uppercase text-sm">{tab}</span>
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
                        <h3 className="mb-4 text-sm font-medium uppercase">
                          {productTitle}
                        </h3>
                        <div className="text-sm mb-4">
                          <p className="mb-4">артикул: {articleNumber}</p>
                        </div>
                        {content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-sm mb-4">
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
                                <div key={index} className="flex items-center pb-2">
                                  <div className="text-gray-500 text-sm flex-shrink-0">
                                    {spec.name}
                                  </div>
                                  <div className="flex-1 mx-2 border-b border-dotted border-gray-300"></div>
                                  <div className="text-sm flex-shrink-0">
                                    {spec.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm">{content}</p>
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
                <SafeImage
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
                  <ProductRating productId={product.id} showCount={true} size="lg" />
                </div>
                <span className="mx-2">•</span>
                <span className="text-sm">6 отзывов</span>
              </div>
                
              <div className="flex items-center mb-2">
                <div className="uppercase"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "1.4px",
                      lineHeight: 1.5,
                      textTransform: "uppercase"
                    }}>
                  {productCategory}
                </div>
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
                        lineHeight: 1.1
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
                    
                    <div className="flex flex-col">
                      {product.images
                        .slice(visibleThumbStartIndex, visibleThumbStartIndex + 4)
                        .map((image, index) => {
                          const actualIndex = index + visibleThumbStartIndex;
                          return (
                            <div 
                              key={image.id}
                              onClick={() => setSelectedImageIndex(actualIndex)}
                              className={`relative cursor-pointer my-2 transition-all duration-200 ${selectedImageIndex === actualIndex ? 'opacity-100 ring-2 ring-black' : 'opacity-50 hover:opacity-75'}`}
                              style={{ width: "70px", height: "70px" }}
                            >
                              <SafeImage
                                src={image.url}
                                alt={`Thumbnail ${actualIndex + 1}`}
                                fill
                                sizes="70px"
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
              
              <div className="relative flex flex-col">
                <div className="relative">
                  {isNew && (
                    <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-[#BAFF29] text-black text-xs font-bold uppercase">
                      NEW
                    </div>
                  )}
                  {isHit && !isNew && (
                    <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-red-500 text-white text-xs font-bold uppercase">
                      HIT
                    </div>
                  )}
                  {!isNew && !isHit && discountPercentage && (
                    <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-[#FF3998] text-white text-xs font-bold uppercase">
                      -{discountPercentage}%
                    </div>
                  )}
                  
                  <div style={{ width: "989px", height: "674px", position: "relative" }} className="group">
                    {product.images && product.images.length > 0 && (
                      <SafeImage
                        src={product.images[selectedImageIndex].url}
                        alt={`Product image ${selectedImageIndex + 1}`}
                        fill
                        priority
                        sizes="989px"
                        style={{ objectFit: "cover" }}
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
                    {product.metadata?.bulk_discount === "true" ? (
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
                          КОЛИЧЕСТВО / ШТ
                        </div>
                        <div className="inline-flex items-center justify-center border border-gray-300 w-16 h-10">
                          <input 
                            type="number" 
                            min="1" 
                            value={quantity} 
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full h-full text-center outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {product.options?.some(option => 
                    option.title.toLowerCase().includes('цвет') || 
                    option.title.toLowerCase().includes('color')
                  ) && (
                    <div className="mb-6">
                      <ColorSelector 
                        product={product}
                        selectedOptions={selectedOptions}
                        onOptionChange={handleOptionChange}
                      />
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <div 
                      className="font-medium"
                      style={{ fontSize: "30px" }}
                    >
                      <ProductPrice 
                        product={product} 
                        region={region} 
                        variant={product.variants?.[0]}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6 group cursor-pointer">
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
                      по промокоду
                    </span>
                    <svg className="ml-2 w-4 h-4 transition-colors duration-200 group-hover:stroke-[#C2E7DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center mb-6 transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer" style={{ fontSize: "14px" }}>
                    <div className="rounded-full w-5 h-5 border border-gray-300 flex items-center justify-center mr-2">
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>i</span>
                    </div>
                    <LocalizedClientLink href="/account/login" className="font-medium hover:no-underline">авторизуйся</LocalizedClientLink>
                    <span className="ml-1">и получай бонусы</span>
                  </div>
                  
                  <div className="flex mb-6 gap-2">
                    <button 
                      className={`${addSuccess ? 'bg-[#C2E7DA]' : 'bg-black'} text-white uppercase font-medium transition-colors duration-200 hover:bg-[#C2E7DA] hover:text-black`}
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
                      disabled={isAddingToCart}
                    >
                      {isAddingToCart ? 'Добавление...' : addSuccess ? 'Добавлено ✓' : 'Добавить в корзину'}
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
                  
                  <div className="flex items-center font-medium transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer">
                    <span 
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "1.4px",
                        lineHeight: 1.5,
                        textTransform: "uppercase"
                      }}
                    >
                      Наличие в магазинах
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
                      <p className="mb-4">артикул: {articleNumber}</p>
                    </div>
                    {tabContent[selectedTab].split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-base mb-4" style={{ fontSize: "16px", lineHeight: 1.5 }}>
                        {paragraph}
                      </p>
                    ))}
                  </>
                ) : (
                  <p className="text-base" style={{ fontSize: "16px", lineHeight: 1.5 }}>
                    {tabContent[selectedTab]}
                  </p>
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
                  <SafeImage
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
                {productCategory}
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
                    lineHeight: 1.1
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
                            <SafeImage
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
                    <SafeImage
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
      
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setIsSupportModalOpen(false)}
          />
          
          <div className={`${isMobile ? 'w-full' : 'w-[520px]'} bg-white h-full flex flex-col`}>
            <button
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 flex flex-col" style={{ 
              paddingLeft: isMobile ? "20px" : "80px", 
              paddingRight: isMobile ? "20px" : "80px", 
              paddingTop: isMobile ? "60px" : "120px", 
              paddingBottom: isMobile ? "40px" : "60px" 
            }}>
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-medium mb-4`}>напишите нам</h2>
              
              <p className="text-gray-600 mb-8">
                Выберите мессенджер – мы ответим на ваши вопросы в онлайн-чате.
              </p>
              
              <div className="space-y-4 flex-1">
                <button className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 mr-4 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63" fill="#25D366"/>
                    </svg>
                  </div>
                  <span className="font-medium">WhatsApp</span>
                </button>
                
                <button className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 mr-4 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.378 2.618-1.408 3.089-2.377 3.089-.818 0-1.447-.613-1.447-1.448 0-.896.896-8.96.896-8.96.169-1.79.896-2.377 2.208-2.377.896 0 1.617.613 1.617 1.448v1.52z" fill="#0088cc"/>
                    </svg>
                  </div>
                  <span className="font-medium">Telegram</span>
                </button>
              </div>
              
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors uppercase mt-8"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "1.4px",
                  lineHeight: 1.5
                }}
              >
                закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex gap-2">
            <button 
              className={`${addSuccess ? 'bg-[#C2E7DA]' : 'bg-black'} text-white uppercase font-medium transition-colors duration-200 hover:bg-[#C2E7DA] hover:text-black flex-1`}
              style={{
                height: "50px",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "1.4px",
                lineHeight: 1.5,
                textTransform: "uppercase"
              }}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? 'Добавление...' : addSuccess ? 'Добавлено ✓' : 'Добавить в корзину'}
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
    </div>
  )
}

export default ProductTemplate