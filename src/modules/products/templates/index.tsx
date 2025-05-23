"use client";
import React, { Suspense, useState, useEffect } from "react"

import ProductGallery from "@modules/products/components/product-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "@modules/products/components/product-reviews"
import Breadcrumbs, { BreadcrumbItem } from "@modules/common/components/breadcrumbs"
import ProductPrice from "@modules/products/components/product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { getWishlist, addToWishlist, removeFromWishlist, retrieveCustomer } from "@lib/data/customer"
import SafeImage from "@modules/common/components/safe-image"

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
  // Состояния для функциональности кнопок
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("ОПИСАНИЕ");
  const params = useParams();
  
  // Индекс выбранного изображения для галереи
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // Индекс первой видимой миниатюры в списке (для скроллинга)
  const [visibleThumbStartIndex, setVisibleThumbStartIndex] = useState(0);
  
  // Флаги для отслеживания состояния загрузки данных
  const [customerLoaded, setCustomerLoaded] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  
  // Загрузка данных клиента только один раз при монтировании компонента
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
  
  // Отдельный эффект для загрузки избранного (только если клиент авторизован)
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

  // Функция добавления в корзину
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
      
      // Сбросить сообщение об успехе через 2 секунды
      setTimeout(() => {
        setAddSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Функция управления избранным
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

  // Функции для навигации по миниатюрам
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

  if (!product || !product.id) {
    return notFound()
  }

  // Отладка структуры объекта product
  console.log("Product structure:", {
    id: product.id,
    title: product.title,
    categories: product.categories
  })

  // Формируем хлебные крошки на основе категорий продукта
  const breadcrumbItems: BreadcrumbItem[] = []
  
  // В реальном приложении берем данные из product
  if (product.collection) {
    breadcrumbItems.push({
      name: product.collection.title || "Категория",
      path: `/collections/${product.collection.handle}`
    })
  }
  
  // Используем заглушку для категории, пока не добавим API запрос к product_category
  const productCategory = "Shirts" // Заглушка - первая категория из скриншота БД
  // Получаем название продукта
  const productTitle = product.title || ""
  // Получаем подзаголовок или тип продукта - если нет, не отображаем
  const productSubtitle = product.subtitle || ""
  // Получаем варианты продукта для отображения объема/размера/количества
  const variants = product.variants || []
  // Проверяем, есть ли бирка NEW у продукта
  const isNew = product.metadata?.is_new === "true" || false // Берем из метаданных продукта
  // Артикул продукта
  const articleNumber = product.metadata?.article as string || "99000048271"

  // Получаем город доставки или устанавливаем значение по умолчанию
  const deliveryCity = product.metadata?.delivery_city as string || "Челябинск"
  // Получаем дату доставки или устанавливаем значение по умолчанию
  const deliveryDate = product.metadata?.delivery_date as string || "28 мая"

  // В реальном приложении эти значения будут получены из API
  const tabContent: Record<string, string> = {
    "ОПИСАНИЕ": product.description || "Пудра обогащена витаминами, регулирует работу сальных желез, способствует увлажнению и питанию изнутри. Этот продукт для лица поможет решить проблемы с воспалениями, избытком себума, забиванием пор, а также поможет уменьшить появление акне и сделает следы постакне менее заметными. Регулярное использование этого продукта позволит достичь ровного тонуса кожи и естественного сияния.\n\nНежная пудра для умывания мягко удаляет омертвевшие клетки, не вызывая шелушения. Умывалка для лица бережно и эффективно очистит кожу от загрязнений и остатков макияжа. Этот уход активизирует процесс обновления кожных клеток, борется со старением, помогает разгладить морщины и неровности, а также уменьшает пигментацию.\n\nСпециальный комплекс активных компонентов в составе пудры смягчает и матирует кожный покров, делая его чистым, свежим и привлекательным. Наш пилинг порошок подходит для жирной, нормальной, проблемной и чувствительной кожи.",
    "ПРИМЕНЕНИЕ": "Нанесите пудру на влажную кожу, добавьте немного воды и аккуратно помассируйте лицо круговыми движениями, избегая области вокруг глаз. Затем смойте теплой водой.",
    "СОСТАВ": "Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Sodium Chloride, Papain, Zinc PCA, Citric Acid, Parfum, Phenoxyethanol, Ethylhexylglycerin.",
    "БРЕНД": "LUVINE - российский бренд косметики, специализирующийся на средствах для ухода за кожей. Продукция бренда сочетает натуральные ингредиенты и инновационные технологии.",
    "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": "Срок годности: 24 месяца с даты изготовления. Хранить в сухом, защищенном от прямых солнечных лучей месте при температуре от +5°C до +25°C."
  };

  // Характеристики продукта (в идеале брать из метаданных)
  const productSpecs = [
    { name: "тип продукта", value: "пудра энзимная" },
    { name: "для кого", value: "унисекс" },
    { name: "назначение", value: "очищение, выравнивание тона, матирование, против акне" },
    { name: "тип кожи", value: "для всех типов кожи" },
    { name: "область применения", value: "лицо" },
    { name: "возраст", value: "от 14 лет" },
    { name: "объём", value: "100 мл" }
  ];

  return (
    <div className="pb-16 mt-[100px]">
      {/* Верхний блок с хлебными крошками, категорией и названием - смещен вправо от центра */}
      <div className="content-container flex items-start mt-4 mb-6">
        <div className="flex w-1/2 items-center self-center justify-start">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        
        <div className="flex flex-col w-1/2" style={{ paddingLeft: "20px" }}>
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <span className="text-lg">★★★★☆</span>
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
      
      {/* Основная информация о продукте - галерея и опции */}
      <div className="content-container flex justify-center mb-16">
        <div className="flex relative">
          {/* Миниатюры слева от основной фотографии - выровнены по центру */}
          {product.images && product.images.length > 1 && (
            <div className="absolute top-1/2 transform -translate-y-1/2" style={{ right: "calc(100% + 60px)" }}>
              <div className="flex flex-col items-center">
                {/* Стрелка вверх */}
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
                
                {/* Отображаем только 4 миниатюры */}
                <div className="flex flex-col">
                  {product.images
                    .slice(visibleThumbStartIndex, visibleThumbStartIndex + 4)
                    .map((image, index) => {
                      const actualIndex = index + visibleThumbStartIndex;
                      return (
                        <div 
                          key={image.id}
                          onClick={() => setSelectedImageIndex(actualIndex)}
                          className={`relative cursor-pointer my-2 transition-opacity ${selectedImageIndex === actualIndex ? 'opacity-100 ring-1 ring-black' : 'opacity-50'}`}
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
                
                {/* Стрелка вниз */}
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
          
          {/* Основная фотография */}
          <div className="relative flex flex-col">
            <div className="relative">
              {isNew && (
                <div className="absolute top-4 left-4 z-10 inline-flex px-2 py-1 bg-[#D0FD3E] text-xs font-medium">
                  NEW
                </div>
              )}
              {/* Отображаем выбранное изображение */}
              <div style={{ width: "989px", height: "674px", position: "relative" }}>
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
              </div>
            </div>
            
            {/* Блоки с гарантией и доставкой */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex items-center border border-gray-200 p-3 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.31 8l5.39 9.333A9.953 9.953 0 0122 12c0-5.523-4.477-10-10-10a9.953 9.953 0 00-5.333 1.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Гарантия качества</div>
                  <div>продукции</div>
                </div>
              </div>
              <div className="flex items-center border border-gray-200 p-3 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <span className="font-bold">₽</span>
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Бесплатная доставка от</div>
                  <div>1500 ₽</div>
                </div>
              </div>
              <div className="flex items-center border border-gray-200 p-3 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <span className="font-bold">RU</span>
                </div>
                <div className="text-xs">
                  <div className="font-semibold">Доставка по всей</div>
                  <div>территории РФ</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Блок с ценой и кнопками - новые отступы: padding: 60px 90px 0 */}
          <div style={{ padding: "60px 90px 0" }}>
            <div className="w-[400px]">
              {/* Всегда показываем блок с количеством */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 uppercase mr-6">
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
              </div>
              
              {/* Цена */}
              <div className="mb-6">
                <div className="text-4xl font-medium">
                  <ProductPrice 
                    product={product} 
                    region={region} 
                    variant={product.variants?.[0]}
                  />
                </div>
                
                {/* Промокод */}
                <div className="inline-flex items-center bg-[#D0FD3E] text-xs px-2 py-1 mt-3">
                  <span className="font-medium">ВМЕСТЕ | -25%</span>
                  <span className="ml-2">по промокоду →</span>
                </div>
                
                {/* Авторизация для бонусов */}
                <div className="flex items-center mt-3 text-sm">
                  <div className="rounded-full w-4 h-4 bg-gray-200 flex items-center justify-center mr-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <LocalizedClientLink href="/account/login" className="font-medium underline">авторизуйся</LocalizedClientLink>
                  <span className="ml-1">и получай бонусы</span>
                </div>
              </div>
              
              {/* Кнопки действий */}
              <div className="flex mb-6">
                <button 
                  className={`flex-grow ${addSuccess ? 'bg-green-600' : 'bg-black'} text-white py-4 uppercase text-sm font-medium`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? 'Добавление...' : addSuccess ? 'Добавлено ✓' : 'Добавить в корзину'}
                </button>
                <button 
                  className="ml-2 w-16 h-16 border border-gray-300 flex items-center justify-center"
                  onClick={handleWishlistToggle}
                  disabled={isLoadingWishlist || !customer}
                >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill={isInWishlist ? "black" : "none"} 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="black" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              
              {/* Наличие в магазинах */}
              <div className="flex items-center text-sm font-medium">
                <span>Наличие в магазинах</span>
                <span className="ml-1">►</span>
              </div>
            </div>
          </div>
          
          {/* Скрытый блок с действиями с продуктом для сохранения функциональности */}
          <div className="hidden">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Содержимое с ограничением ширины */}
      <div className="mx-auto" style={{ maxWidth: "760px" }}>
        {/* Блок с выбором города и информацией о доставке - перемещен перед описанием */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="font-medium">{deliveryCity}</div>
            <span className="ml-2">▼</span>
          </div>
          <div className="border-b border-gray-200 my-2"></div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">курьер</span>
            <span>{deliveryDate}</span>
          </div>
          <div className="border-b border-gray-200 my-2"></div>
          <div className="text-center text-sm">
            <a href="#" className="text-gray-500 underline">подробнее о доставке</a>
          </div>
        </div>

        {/* Табы с дополнительной информацией */}
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
        
        {/* Характеристики продукта */}
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
              <div key={index} className="flex border-b border-gray-200 pb-2">
                <div className="w-1/3 text-gray-500" style={{
                  color: "#7f7f7f",
                  fontSize: "14px",
                  lineHeight: 1.4
                }}>
                  {spec.name}
                </div>
                <div className="w-2/3" style={{
                  fontSize: "14px",
                  lineHeight: 1.4
                }}>
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Служба поддержки */}
        <div className="flex justify-center items-center my-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gray-300 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-sm text-gray-500">нужна помощь?</div>
            <div className="font-medium">служба поддержки</div>
          </div>
        </div>
      </div>
      
      {/* Блок "Посмотрите еще" */}
      <div className="content-container my-16">
        <h2 className="text-2xl font-medium mb-8">посмотрите ещё</h2>
        <div className="flex overflow-x-auto pb-4 gap-4">
          <div className="flex-shrink-0 h-16 bg-[#D6FF32] rounded-full flex items-center px-6">
            <div className="text-4xl font-bold mr-4">L</div>
            <div className="font-medium">Luvine</div>
          </div>
          <div className="flex-shrink-0 h-16 bg-white rounded-full flex items-center px-6 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-pink-200 mr-4"></div>
            <div>
              <div className="font-medium">очищение</div>
              <div className="text-sm">и демакияж Luvine</div>
            </div>
          </div>
          <div className="flex-shrink-0 h-16 bg-white rounded-full flex items-center px-6 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-pink-200 mr-4"></div>
            <div>
              <div className="font-medium">очищение</div>
              <div className="text-sm">и демакияж</div>
            </div>
          </div>
          <div className="flex-shrink-0 h-16 bg-white rounded-full flex items-center px-6 border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-yellow-200 mr-4"></div>
            <div>
              <div className="font-medium">уход</div>
              <div className="text-sm">за лицом</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Блок "Рейтинг и отзывы" */}
      <div className="content-container my-16 pt-16">
        <ProductReviews productId={product.id} />
      </div>
      
      {/* Похожие товары */}
      <div className="content-container my-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">похожие товары</h2>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
