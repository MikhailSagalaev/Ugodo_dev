import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SafeImage from "@modules/common/components/safe-image"

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
  // Проверяем URL изображения и показываем заглушку, если изображения нет
  const showPlaceholder = imageUrl === "/placeholder.svg" || !imageUrl || imageUrl === "/images/banners/placeholder.svg"
  
  // Функция для определения стиля кнопки на основе варианта
  const getButtonClass = () => {
    switch (variant) {
      case "dark":
        return "bg-white text-black hover:bg-white/90"
      case "gradient":
        return "bg-[#cbf401] text-black hover:bg-[#d8ff00]"
      case "colored":
        return "bg-[#cbf401] text-black hover:bg-[#d8ff00]"
      case "light":
      default:
        return "bg-black text-white hover:bg-black/90"
    }
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden my-12">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 w-full h-full">
        {showPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-violet-500 to-purple-600">
            <span className="text-white text-xl">Изображение баннера будет здесь</span>
          </div>
        ) : (
          <SafeImage
            src={imageUrl}
            alt={title}
            fill
            className="object-cover object-center brightness-75"
            sizes="100vw"
            startWithPlaceholder={true}
          />
        )}
        
        {/* Затемнение для лучшей читаемости текста */}
        <div className={`absolute inset-0 ${position === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-black/60 to-transparent`}></div>
      </div>
      
      {/* Контент поверх изображения */}
      <div className="relative z-10 h-full content-container flex items-center">
        <div className={`max-w-lg ${position === "right" ? "ml-0" : "ml-auto"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white">{title}</h2>
          {subtitle && <p className="mb-6 text-white/90 text-lg">{subtitle}</p>}
          <LocalizedClientLink href={buttonLink} className="w-fit">
            <Button 
              className={`${getButtonClass()} px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-32 h-12`}
              size="large"
            >
              {buttonText}
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default PromoBanner 