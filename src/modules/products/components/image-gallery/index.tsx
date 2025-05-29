import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import SafeImage from "@modules/common/components/safe-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
              id={image.id}
            >
              <SafeImage
                src={image.url}
                priority={index <= 2}
                className="absolute inset-0 rounded-rounded"
                alt={`Product image ${index + 1}`}
                fill
                sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
