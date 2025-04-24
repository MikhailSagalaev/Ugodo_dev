import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type PromoBannerProps = {
  title: string
  subtitle?: string
  buttonText: string
  buttonLink: string
  imageUrl: string
  variant?: "light" | "dark" | "gradient" | "colored"
  position?: "left" | "right"
}

const PromoBanner = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  imageUrl,
  variant = "light",
  position = "right",
}: PromoBannerProps) => {
  // Функция для определения класса фона на основе варианта
  const getBgColorClass = () => {
    switch (variant) {
      case "dark":
        return "bg-gray-900 text-white"
      case "gradient":
        return "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
      case "colored":
        return "bg-[#cbf401] text-black"
      case "light":
      default:
        return "bg-[#f3f3f3] text-gray-800"
    }
  }
  
  // Функция для определения стиля кнопки на основе варианта
  const getButtonClass = () => {
    switch (variant) {
      case "dark":
        return "bg-white text-black hover:bg-white/90"
      case "gradient":
        return "bg-white text-violet-700 hover:bg-white/90"
      case "colored":
        return "bg-black text-white hover:bg-black/90"
      case "light":
      default:
        return "bg-black text-white hover:bg-black/90"
    }
  }

  // Проверяем URL изображения и показываем заглушку, если изображения нет
  const showPlaceholder = imageUrl === "/placeholder.svg" || !imageUrl

  return (
    <div className="content-container my-12">
      <div className={`flex flex-col ${position === "left" ? "md:flex-row-reverse" : "md:flex-row"} rounded-2xl overflow-hidden shadow-md`}>
        <div className={`${getBgColorClass()} p-8 md:p-12 flex flex-col justify-center md:w-1/2`}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">{title}</h2>
          {subtitle && <p className="mb-6 opacity-90">{subtitle}</p>}
          <LocalizedClientLink href={buttonLink} className="w-fit">
            <Button 
              className={`${getButtonClass()} px-6 py-3 rounded-lg font-medium transition-all duration-200`}
              size="large"
            >
              {buttonText}
            </Button>
          </LocalizedClientLink>
        </div>
        
        <div className="relative aspect-video md:aspect-auto md:w-1/2 bg-neutral-100">
          {showPlaceholder ? (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <span className="text-neutral-400">Изображение будет здесь</span>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover object-center"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PromoBanner 