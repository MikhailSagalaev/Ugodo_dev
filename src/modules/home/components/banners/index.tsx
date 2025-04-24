import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type InfoBannerProps = {
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
  variant?: "primary" | "secondary" | "accent"
}

const InfoBanner = ({
  title,
  description,
  buttonText,
  buttonLink,
  variant = "primary",
}: InfoBannerProps) => {
  // Определяем стиль баннера в зависимости от варианта
  const getBannerStyle = () => {
    switch (variant) {
      case "secondary":
        return "bg-gradient-to-r from-violet-50 to-pink-50 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-600"
      case "accent":
        return "bg-[#cbf401] text-black"
      case "primary":
      default:
        return "text-violet-600"
    }
  }
  
  // Определяем фон баннера в зависимости от варианта
  const getBackgroundStyle = () => {
    switch (variant) {
      case "secondary":
        return "bg-gradient-to-r from-violet-50 to-pink-50"
      case "accent":
        return "bg-[#f3f3f3]"
      case "primary":
      default:
        return "bg-white border border-neutral-200"
    }
  }

  return (
    <div className="content-container my-12">
      <div className={`flex flex-col items-center py-10 px-6 rounded-2xl ${getBackgroundStyle()} text-center`}>
        <h2 className={`text-2xl md:text-3xl font-semibold mb-2 ${variant === "secondary" ? getBannerStyle() : ""}`}>
          {title}
        </h2>
        <p className="mb-6 text-gray-700 max-w-md">
          {description}
        </p>
        {buttonText && buttonLink && (
          <LocalizedClientLink href={buttonLink}>
            <Button 
              className={variant === "accent" 
                ? "bg-black text-white hover:bg-black/90" 
                : "bg-[#cbf401] hover:bg-[#d8ff00] text-black"
              }
              size="large"
            >
              {buttonText}
            </Button>
          </LocalizedClientLink>
        )}
      </div>
    </div>
  )
}

export default InfoBanner 