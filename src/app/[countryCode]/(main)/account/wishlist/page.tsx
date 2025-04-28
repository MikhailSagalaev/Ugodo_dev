'use client'

import React from 'react'
import { useWishlist } from '@lib/context/wishlist-context'
import { useAccount } from '@lib/contexts/account'
import ProductPreview from '@modules/products/components/product-preview'
import WishlistButton from '@modules/common/components/wishlist-button' // Используем ту же кнопку
import SkeletonProductPreview from '@modules/skeletons/components/skeleton-product-preview'
import { Heading, Text, Container } from '@medusajs/ui'
import Link from 'next/link'
import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCustomer } from "@lib/data"

export default function WishlistPage() {
  const { customer, retrievingCustomer } = useAccount()
  const { wishlist, wishlistItems, loading, error } = useWishlist()

  if (retrievingCustomer || loading) {
    // Показываем скелетоны во время загрузки
    return (
      <Container className="py-12">
        <Heading as="h1" className="text-2xl font-semibold mb-8">Избранное</Heading>
        <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
          {Array.from(Array(4).keys()).map((i) => (
            <li key={i}>
              <SkeletonProductPreview />
            </li>
          ))}
        </ul>
      </Container>
    )
  }

  if (!customer) {
    // Предлагаем войти
    return (
       <Container className="py-12 text-center">
         <Heading as="h1" className="text-2xl font-semibold mb-4">Избранное</Heading>
         <Text className="mb-4">Пожалуйста, <Link href="/account/login" className='text-blue-600 hover:underline'>войдите в аккаунт</Link>, чтобы просмотреть список избранного.</Text>
      </Container>
    )
  }
  
  if (error) {
     return (
       <Container className="py-12 text-center">
          <Heading as="h1" className="text-2xl font-semibold mb-4">Избранное</Heading>
          <Text className="text-red-500">{error}</Text>
      </Container>
    )
  }
  
  if (!wishlist || wishlistItems.length === 0) {
    // Сообщение, если список пуст
    return (
      <Container className="py-12 text-center">
        <Heading as="h1" className="text-2xl font-semibold mb-4">Избранное</Heading>
        <Text className="mb-4">Ваш список избранного пуст.</Text>
        <Link href="/store" className='text-blue-600 hover:underline'>К покупкам</Link>
      </Container>
    )
  }

  // Отображаем список избранного
  return (
    <Container className="py-12">
      <Heading as="h1" className="text-2xl font-semibold mb-8">Избранное</Heading>
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {wishlistItems.map((item) => (
          item.variant?.product && item.variant_id && (
            <li key={item.id} className="relative"> {/* Добавляем relative для позиционирования кнопки */}
              <ProductPreview 
                // @ts-ignore - Временное игнорирование, т.к. тип Product может не полностью совпадать
                product={item.variant.product} 
                categoryTitle={item.variant.product.type?.value || undefined} 
              />
               {/* Можно добавить кнопку удаления прямо на карточку */}
               {/* 
               <div className='absolute top-2 right-10 z-20'> 
                 <WishlistButton variantId={item.variant_id} /> 
               </div>
               */}
            </li>
          )
        ))}
      </ul>
    </Container>
  )
} 