'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import ProductPreview from "@modules/products/components/product-preview"

const INITIAL_LOAD = 20
const LOAD_MORE_COUNT = 20

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD)
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
    setVisibleCount(INITIAL_LOAD)
  }, [products]);

  const memoizedProducts = useMemo(() => products, [products]);
  const visibleProducts = useMemo(() => 
    memoizedProducts.slice(0, visibleCount), 
    [memoizedProducts, visibleCount]
  );

  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= memoizedProducts.length) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, memoizedProducts.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, visibleCount, memoizedProducts.length]);

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
              grid 
              ${isTabletOrMobile ? 'grid-cols-2 gap-x-[30px] gap-y-[80px] max-w-[500px]' : 
                isTablet ? 'grid-cols-3 gap-x-[25px] gap-y-[70px] px-4 max-w-[750px]' : 
                isMidTablet ? 'grid-cols-4 gap-x-[15px] gap-y-[80px]' :
                'grid-cols-4 px-0'}
              ${isTabletOrMobile || isTablet ? '' : isMidTablet ? 'max-w-[980px]' : 'w-full'}
            justify-center
          `}
          style={!isTabletOrMobile && !isTablet && !isMidTablet ? { gap: 'clamp(18px, 2.5vw, 30px)' } : {}}
          >
            {visibleProducts.map((p, index) => {
              const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
              return (
                <div key={p.id} className="flex justify-center">
                  <div 
                    className={`w-full aspect-[3/4] ${!isTabletOrMobile && !isTablet ? 'product-card-catalog' : ''}`}
                  >
                    <ProductPreview 
                      product={p} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      firstInRow={
                        isTabletOrMobile ? index % 2 === 0 : 
                        isTablet ? index % 3 === 0 : 
                        isMidTablet ? index % 4 === 0 :
                        false
                      }
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