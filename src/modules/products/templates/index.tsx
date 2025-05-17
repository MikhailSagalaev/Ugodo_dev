import React, { Suspense } from "react"

import ProductGallery from "@modules/products/components/product-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { ProductRelatedBanner } from "@modules/banner/components"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "@modules/products/components/product-reviews"

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
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative gap-x-6 px-4 small:px-0"
        data-testid="product-container"
      >
        {/* Левая колонка: Галерея */}
        <div className="w-full small:w-1/2 mb-4 small:mb-0 order-1">
          <ProductGallery images={product?.images || []} />
        </div>

        {/* Правая колонка: Информация и Действия */}
        <div className="flex flex-col w-full small:w-1/2 small:sticky small:top-[118px] gap-y-6 order-2">
          <ProductInfo product={product} />
           {/* Обертка для действий, чтобы они были в этой колонке */}
           <div className="w-full">
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
        {/* ProductOnboardingCta можно убрать или переместить, если не нужен в этой колонке */}
        {/* <ProductOnboardingCta /> */}

      </div>

      {/* Табы под основной информацией */}
      <div className="content-container my-16 px-4 small:px-0" data-testid="product-tabs-container">
        <ProductTabs product={product} />
      </div>
      
      {/* Баннер для связанных продуктов */}
      <div className="content-container my-8 px-4 small:px-0">
        <ProductRelatedBanner />
      </div>
      
      {/* Блок отзывов */}
      <div className="content-container my-16 px-4 small:px-0" data-testid="product-reviews-container">
        <ProductReviews productId={product.id} />
      </div>
      
      <div
        className="content-container my-16 small:my-32 px-4 small:px-0"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
