"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text, Input, Label } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import Image from "next/image"

import { addToCart } from "@lib/data/cart"
import { getWishlist, addToWishlist, removeFromWishlist, retrieveCustomer } from "@lib/data/customer"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import ProductPrice from "@modules/products/components/product-price"
import { Heart, Play, ShoppingBag } from "lucide-react"
import MobileActions from "@modules/products/components/mobile-actions"
import ProductActionsInner from "@modules/products/components/product-actions-inner"
import { Region } from "@medusajs/medusa"

// Тип для пропсов
type ProductDetailsClientProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion | Region
}

// Вспомогательная функция для опций варианта
const optionsAsKeymap = (variantOptions: HttpTypes.StoreProductVariant["options"]) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

// Функция форматирования цены
const formatPrice = (amount: number | undefined | null, currencyCode: string) => {
  if (amount === undefined || amount === null) {
    return "Цена не найдена";
  }
  return new Intl.NumberFormat(undefined, { // Используем локаль браузера по умолчанию
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2, // Показываем копейки
    maximumFractionDigits: 2,
  }).format(amount / 100); // Делим на 100, т.к. Medusa хранит цены в минорных единицах
}

// Функция для рендеринга SVG (пример, можно доработать)
const renderSvg = (svgHtml: string) => {
  return <div dangerouslySetInnerHTML={{ __html: svgHtml }} />;
};

export default function ProductDetailsClient({ product, region }: ProductDetailsClientProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false)
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<HttpTypes.StoreProductVariant>()

  const countryCode = useParams().countryCode as string
  const infoRef = useRef<HTMLDivElement>(null)

  // --- Логика вариантов и опций ---
  useEffect(() => {
    // Инициализация опций по умолчанию, если они есть
    const defaultOptions: Record<string, string | undefined> = {};
    product.options?.forEach(option => {
      // Можно установить первое значение как дефолтное, если нужно
      // defaultOptions[option.id] = option.values?.[0]?.value;
    });
    setOptions(defaultOptions);

    // Автовыбор единственного варианта (оставляем)
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.options, product.variants])

  useEffect(() => {
    if (!product.variants || product.variants.length === 0) {
      setSelectedVariant(undefined)
      return;
    }
    // Убедимся, что сравниваем только выбранные опции
    const currentOptionIds = product.options?.map(o => o.id) || [];
    const relevantOptions = Object.keys(options)
      .filter(key => currentOptionIds.includes(key) && options[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = options[key];
        return obj;
      }, {} as Record<string, string | undefined>);
      
    // Проверяем, что все опции товара выбраны
    if (Object.keys(relevantOptions).length !== currentOptionIds.length) {
        setSelectedVariant(undefined);
        return;
    }

    const variant = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(relevantOptions, variantOptions)
    })
    setSelectedVariant(variant);

  }, [product.variants, product.options, options]); // Добавляем options в зависимости useEffect

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => {
      // Если кликнули по уже выбранному значению, снимаем выбор
      if (prev[optionId] === value) {
        const newOptions = { ...prev };
        delete newOptions[optionId]; // Удаляем ключ из объекта
        return newOptions;
      } else {
        // Иначе, устанавливаем новое значение
        return { ...prev, [optionId]: value };
      }
    });
  }

  // --- НОВАЯ ЛОГИКА: Проверка доступности вариантов для опций ---
  const variantAvailability = useMemo(() => {
    const availabilityMap: Record<string, Record<string, boolean>> = {};
    if (!product.options || !product.variants) {
      return availabilityMap;
    }

    product.options.forEach(option => {
      availabilityMap[option.id] = {};
      option.values?.forEach(value => {
        // Находим варианты, которые соответствуют текущей опции и значению,
        // А ТАКЖЕ другим УЖЕ ВЫБРАННЫМ опциям
        const potentialVariant = product.variants?.find(v => {
          const variantOptions = optionsAsKeymap(v.options);
          // Проверяем соответствие текущей опции/значению
          if (variantOptions[option.id] !== value.value) return false;
          // Проверяем соответствие другим выбранным опциям
          for (const otherOptionId in options) {
            if (otherOptionId !== option.id && options[otherOptionId] !== undefined) {
              if (variantOptions[otherOptionId] !== options[otherOptionId]) {
                 return false;
              }
            }
          }
          return true;
        });
        
        // Определяем доступность найденного варианта
        const isAvailable = potentialVariant 
          ? (!potentialVariant.manage_inventory || 
             potentialVariant.allow_backorder || 
             (potentialVariant.inventory_quantity ?? 0) > 0)
          : false; // Если вариант для комбинации не найден, считаем недоступным
          
        availabilityMap[option.id][value.value] = isAvailable;
      });
    });
    return availabilityMap;
  }, [product.options, product.variants, options]); // Пересчитываем при изменении выбранных опций

  const inStock = useMemo(() => {
    if (!selectedVariant) return false;
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    // Сравниваем с выбранным количеством!
    if (selectedVariant.manage_inventory && (selectedVariant.inventory_quantity ?? 0) >= quantity) return true
    return false
  }, [selectedVariant, quantity]) // Добавляем quantity в зависимости

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    await addToCart({ variantId: selectedVariant.id, quantity, countryCode })
    setIsAdding(false)
  }

  // Логика загрузки покупателя и избранного
  useEffect(() => {
    setIsLoadingCustomer(true)
    retrieveCustomer()
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setIsLoadingCustomer(false))
  }, [])

  useEffect(() => {
    if (customer && !isLoadingCustomer && product.id) {
      setIsLoadingWishlist(true);
      getWishlist()
        .then(items => {
          const item = items.find(i => i.product_id === product.id);
          if (item) {
            setIsInWishlist(true);
            setWishlistItemId(item.id);
          } else {
            setIsInWishlist(false);
            setWishlistItemId(null);
          }
        })
        .catch(err => {
          console.error("Ошибка загрузки избранного:", err);
          setIsInWishlist(false);
          setWishlistItemId(null);
        })
        .finally(() => setIsLoadingWishlist(false));
    } else if (!customer && !isLoadingCustomer) {
        setIsInWishlist(false);
        setWishlistItemId(null);
    }
  }, [customer, product.id, isLoadingCustomer]);


  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!customer || !product.id) return;

    setIsLoadingWishlist(true);
    let success = false;

    if (isInWishlist && wishlistItemId) {
      success = await removeFromWishlist(wishlistItemId);
      if (success) {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } else {
      success = await addToWishlist(product.id);
      if (success) {
        // Перезагружаем список, чтобы получить ID нового элемента
         getWishlist().then(items => {
            const item = items.find(i => i.product_id === product.id);
            if (item) {
                setIsInWishlist(true);
                setWishlistItemId(item.id);
            }
        });
      }
    }
    setIsLoadingWishlist(false);
    if (!success) {
      console.error("Не удалось обновить избранное");
    }
  };

  // --- JSX разметка ---
  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-2" ref={infoRef}>
        <h1 className="text-2xl font-semibold" data-testid="product-title">
          {product.title}
        </h1>

        {product.description && (
          <p className="text-base text-ui-fg-subtle whitespace-pre-wrap">
            {product.description}
          </p>
        )}

        {/* Передаем product, selectedVariant и region в ProductPrice */}
        <ProductPrice product={product} variant={selectedVariant} region={region} />
      </div>

      <div className="flex flex-col gap-y-4">
        {product.options?.map((option) => (
          <div key={option.id}>
            <OptionSelect
              option={option}
              current={options[option.id]}
              updateOption={setOptionValue}
              title={option.title}
              data-testid="option-select"
              disabled={!selectedVariant} // Добавляем disabled, если вариант не выбран
              variant={selectedVariant} // Передаем выбранный вариант
            />
          </div>
        ))}
      </div>

      {/* ProductActionsInner будет получать product, region и selectedVariant */}
      <ProductActionsInner product={product} region={region} variant={selectedVariant} />

      <MobileActions product={product} region={region} variant={selectedVariant} />
    </div>
  )
} 