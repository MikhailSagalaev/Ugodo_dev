import { getWishlist } from "@lib/data/customer"
import ProductCard from "@modules/products/components/product-preview"

export default async function WishlistPage() {
  const wishlist = await getWishlist()

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      {wishlist.length === 0 ? (
        <p>У вас пока нет избранных товаров.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.filter(item => item.product).map((item) => (
            <ProductCard key={item.id} product={item.product!} region={{} as any} />
          ))}
        </div>
      )}
    </div>
  )
} 