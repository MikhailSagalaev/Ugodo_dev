import { HttpTypes } from "@medusajs/types"
import { Container, clx } from "@medusajs/ui"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"
import SmartImage from "@modules/common/components/smart-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: HttpTypes.StoreProductImage[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative overflow-hidden p-4 shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[3/4]": true, // Всегда используем соотношение 3:4
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium", 
          "w-[440px]": size === "large",
          "w-full": size === "full",
          "aspect-[1/1]": size === "square", // Только для квадратных
        }
      )}
      data-testid={dataTestid}
    >
      {initialImage && (
        <SmartImage
          src={initialImage}
          alt="Product image"
          className="absolute inset-0"
          quality={50}
          sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          aspectRatio={size === "square" ? "1/1" : "3/4"}
        />
      )}
      {!initialImage && (
        <div className="w-full h-full absolute inset-0 flex items-center justify-center">
          <PlaceholderImage size={16} />
        </div>
      )}
    </Container>
  )
}

export default Thumbnail
