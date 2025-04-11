import { Button } from "@medusajs/ui"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PromoBannerProps = {
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  imageUrl: string
  variant?: "light" | "dark"
  position?: "left" | "right"
}

const PromoBanner = ({
  title,
  subtitle,
  buttonText = "Смотреть",
  buttonLink = "/collections/all",
  imageUrl,
  variant = "light",
  position = "right"
}: PromoBannerProps) => {
  return (
    <div className="content-container my-8">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-center ${position === "left" ? "md:flex-row-reverse" : ""}`}>
        <div className={`px-4 py-8 ${variant === "dark" ? "bg-black text-white" : "bg-lime-400"}`}>
          <h2 className="text-2xl font-medium mb-2">{title}</h2>
          {subtitle && <p className="mb-4 text-sm">{subtitle}</p>}
          <LocalizedClientLink href={buttonLink}>
            <Button 
              className={`${variant === "dark" ? "bg-white text-black" : "bg-black text-white"}`}
              size="small"
            >
              {buttonText}
            </Button>
          </LocalizedClientLink>
        </div>
        
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-neutral-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  )
}

export default PromoBanner 