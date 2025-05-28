import { HttpTypes } from "@medusajs/types"
import { Container, clx } from "@medusajs/ui"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"
import SafeImage from "@modules/common/components/safe-image"

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
        "relative overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[9/16]": !isFeatured,
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
          "aspect-[1/1]": size === "square",
        }
      )}
      data-testid={dataTestid}
    >
      {initialImage && (
        <SafeImage
          src={initialImage}
          alt="Product image"
          className="absolute inset-0 object-cover object-center"
          draggable={false}
          quality={50}
          fill
          sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
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
