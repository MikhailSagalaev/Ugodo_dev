import { HttpTypes } from "@medusajs/types"
import { FilterState } from "@modules/store/components/product-filters"

export function filterProducts(
  products: HttpTypes.StoreProduct[],
  filters: FilterState
): HttpTypes.StoreProduct[] {
  return products.filter(product => {
    // Фильтр по цветам
    if (filters.colors.length > 0) {
      const productColors = new Set<string>()
      product.variants?.forEach(variant => {
        variant.options?.forEach(option => {
          const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
          if (optionTitle?.includes('цвет') || optionTitle?.includes('color')) {
            productColors.add(option.value)
          }
        })
      })
      
      if (!filters.colors.some(color => productColors.has(color))) {
        return false
      }
    }

    // Фильтр по размерам
    if (filters.sizes.length > 0) {
      const productSizes = new Set<string>()
      product.variants?.forEach(variant => {
        variant.options?.forEach(option => {
          const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
          if (optionTitle?.includes('размер') || optionTitle?.includes('size')) {
            productSizes.add(option.value)
          }
        })
      })
      
      if (!filters.sizes.some(size => productSizes.has(size))) {
        return false
      }
    }

    // Фильтр по материалам
    if (filters.materials.length > 0) {
      if (!product.material || !filters.materials.includes(product.material)) {
        return false
      }
    }

    // Фильтр по брендам
    if (filters.brands.length > 0) {
      const productBrand = product.metadata?.brand as string
      if (!productBrand || !filters.brands.includes(productBrand)) {
        return false
      }
    }

    // Фильтр по полу
    if (filters.gender.length > 0) {
      const productGender = product.metadata?.gender as string
      if (!productGender || !filters.gender.includes(productGender)) {
        return false
      }
    }

    // Фильтр по сезону
    if (filters.season.length > 0) {
      const productSeason = product.metadata?.season as string
      if (!productSeason || !filters.season.includes(productSeason)) {
        return false
      }
    }

    // Фильтр по типу кожи
    if (filters.skinType.length > 0) {
      const productSkinType = product.metadata?.skin_type as string
      if (!productSkinType || !filters.skinType.includes(productSkinType)) {
        return false
      }
    }

    // Фильтр по цели
    if (filters.purpose.length > 0) {
      const productPurpose = product.metadata?.purpose as string
      if (!productPurpose || !filters.purpose.includes(productPurpose)) {
        return false
      }
    }

    // Фильтр по категориям
    if (filters.categories.length > 0) {
      const productCategories = product.categories?.map(cat => cat.name) || []
      if (!filters.categories.some(category => productCategories.includes(category))) {
        return false
      }
    }

    // Фильтр по цене
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange
      let productPrice = 0
      
      if (product.variants?.[0]?.calculated_price?.calculated_amount) {
        productPrice = product.variants[0].calculated_price.calculated_amount
      }
      
      if (productPrice < minPrice || productPrice > maxPrice) {
        return false
      }
    }

    // Фильтр по скидке
    if (filters.hasDiscount) {
      const hasDiscount = product.variants?.some(variant => 
        variant.calculated_price?.original_amount && 
        variant.calculated_price?.calculated_amount &&
        variant.calculated_price.original_amount > variant.calculated_price.calculated_amount
      ) || product.metadata?.discount_percentage
      if (!hasDiscount) {
        return false
      }
    }

    // Фильтр по наличию
    if (filters.inStock) {
      const inStock = product.variants?.some(variant => 
        variant.inventory_quantity && variant.inventory_quantity > 0
      )
      if (!inStock) {
        return false
      }
    }

    return true
  })
} 