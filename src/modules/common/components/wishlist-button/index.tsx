'use client'

import React from 'react'
import { Heart } from "@medusajs/icons"
import { useWishlist } from '@lib/context/wishlist-context'
import { useAccount } from '@lib/contexts/account' // Правильный путь
import Spinner from '@modules/common/icons/spinner' // Исправленный путь к Spinner
import { clx } from "@medusajs/ui"

interface WishlistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variantId: string
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  variantId, 
  className, 
  onClick, 
  ...props 
}) => {
  const { customer } = useAccount()
  const { 
    isInWishlist, 
    addItem, 
    removeItem, 
    getItemFromWishlist, 
    loading: wishlistLoading 
  } = useWishlist()
  
  const [isLoading, setIsLoading] = React.useState(false)

  const inWishlist = isInWishlist(variantId)
  const wishlistItem = getItemFromWishlist(variantId)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Wishlist button clicked. Variant ID:", variantId); // Лог ID
    console.log("Customer status:", customer); // Лог пользователя
    
    e.preventDefault() 
    e.stopPropagation() 

    if (!customer) {
      console.warn("User not logged in. Redirecting to login...");
      // TODO: Показать модалку логина или редирект?
      // router.push("/account/login") 
      return;
    }

    if (!variantId) {
        console.error("Variant ID is required to add/remove from wishlist.");
        return;
    }

    setIsLoading(true)
    try {
      if (inWishlist && wishlistItem?.id) {
        await removeItem(wishlistItem.id) 
      } else {
        await addItem(variantId)
      }
    } finally {
      setIsLoading(false)
    }

    if (onClick) {
      onClick(e)
    }
  }

  const loading = wishlistLoading || isLoading

  return (
    <button
      onClick={handleClick}
      disabled={loading} 
      aria-label={inWishlist ? "Удалить из избранного" : "Добавить в избранное"}
      className={clx(
        "flex items-center justify-center p-2 rounded-md transition-colors",
        {
          'text-rose-500 bg-rose-100 hover:bg-rose-200': inWishlist, 
          'text-gray-400 bg-gray-100 hover:bg-gray-200': !inWishlist, 
          'cursor-not-allowed opacity-50': loading, 
        },
        className 
      )}
      {...props}
    >
      {loading ? (
        <Spinner /> 
      ) : (
        <Heart className={clx("w-7 h-7", { 'fill-current': inWishlist })} />
      )}
    </button>
  )
}

export default WishlistButton 