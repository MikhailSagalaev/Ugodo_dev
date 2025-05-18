import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse flex flex-col rounded-[4px] overflow-hidden border border-gray-200">
      {/* Изображение */}
      <div className="relative h-[360px] bg-ui-bg-subtle">
        {/* Скелетон для бейджей верхнего ряда */}
        <div className="absolute top-0 left-0 flex justify-between w-full">
          <div>
            <div className="h-10 w-[60px] bg-gray-100"></div>
          </div>
          <div>
            <div className="h-10 w-10 bg-gray-100"></div>
          </div>
        </div>
        
        {/* Скелетон для информации о доставке */}
        <div className="absolute bottom-0 right-0">
          <div className="h-6 w-28 bg-gray-100"></div>
        </div>
        
        {/* Скелетон для индикатора видео */}
        <div className="absolute bottom-3 left-3">
          <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
        </div>
      </div>
      
      {/* Контентная часть */}
      <div className="p-4 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="w-1/3 h-5 bg-gray-100"></div>
          <div className="w-4/5 h-6 bg-gray-100"></div>
        </div>
      </div>
      
      {/* Скелетон для цены и кнопки */}
      <div className="mt-auto p-4 pt-0 flex justify-between items-center">
        {/* Кнопка корзины (слева) */}
        <div className="h-10 w-10 bg-gray-100 rounded-md"></div>
        
        {/* Блок цены (справа) */}
        <div className="flex flex-col items-end gap-1">
          <div className="h-4 w-16 bg-gray-100"></div>
          <div className="h-5 w-20 bg-gray-100"></div>
          {/* Скелетон для линии перечеркивания */}
          <div className="relative w-full">
            <div className="absolute top-[2px] h-[1px] w-full bg-gray-100 -rotate-6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
