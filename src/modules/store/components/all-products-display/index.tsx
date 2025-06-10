'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import ProductPreview from "@modules/products/components/product-preview"

const INITIAL_LOAD_DESKTOP = 15
const INITIAL_LOAD_MOBILE = 10
const LOAD_MORE_COUNT_DESKTOP = 15
const LOAD_MORE_COUNT_MOBILE = 10

export default function AllProductsDisplay({
  products,
  region,
}: {
  products: any[]
  region: any
}) {
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isMidTablet, setIsMidTablet] = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletOrMobile(width < 768);
      setIsTablet(width >= 768 && width < 1118);
      setIsMidTablet(width >= 1118 && width < 1233);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const initialLoad = isTabletOrMobile ? INITIAL_LOAD_MOBILE : INITIAL_LOAD_DESKTOP
    setVisibleCount(initialLoad)
  }, [products, isTabletOrMobile]);

  const memoizedProducts = useMemo(() => products, [products]);
  const visibleProducts = useMemo(() => 
    memoizedProducts.slice(0, visibleCount), 
    [memoizedProducts, visibleCount]
  );

  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= memoizedProducts.length) return;
    
    const loadMoreCount = isTabletOrMobile ? LOAD_MORE_COUNT_MOBILE : LOAD_MORE_COUNT_DESKTOP
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev: number) => Math.min(prev + loadMoreCount, memoizedProducts.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, visibleCount, memoizedProducts.length, isTabletOrMobile]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || visibleCount >= memoizedProducts.length) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= documentHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, isLoading, visibleCount, memoizedProducts.length]);

      return (
      <div className="w-full">
        <div className={`overflow-hidden flex justify-center ${!isTabletOrMobile ? 'px-4' : ''}`}>
          {visibleProducts.length > 0 && (
            <div className={`
              catalog-grid
              ${isTabletOrMobile ? 'w-full grid grid-cols-2 gap-x-[5px] gap-y-[20px] px-4' : 
                'w-full px-4 grid grid-cols-5 gap-[12px]'}
          `}
          >
            {visibleProducts.map((p, index) => {
              const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
              return (
                <div key={p.id} className="w-full h-full">
                  <div 
                    className={`w-full h-full product-card-compact ${!isTabletOrMobile ? 'product-card-catalog' : ''}`}
                  >
                    <ProductPreview 
                      product={p} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      firstInRow={isTabletOrMobile ? index % 2 === 0 : index % 5 === 0}
                      textAlign="left"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center mt-8">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        )}
        

      </div>
    </div>
  )
} 