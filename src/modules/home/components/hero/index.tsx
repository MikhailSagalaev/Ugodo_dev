import { Button } from "@medusajs/ui"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="relative h-[400px] w-full border-b border-ui-border-base bg-neutral-100 overflow-hidden">
      {/* Фоновое изображение с моделью */}
      <div className="absolute inset-0">
        <Image 
          src="/images/hero-banner.jpg" 
          alt="Модель в промо-баннере" 
          fill
          priority
          className="object-cover object-center"
        />
      </div>
      
      {/* Текстовый блок */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 z-10">
        <h1 className="text-3xl font-bold mb-2">СКИДКА ДО 50%</h1>
        <Button 
          className="bg-black text-white px-6 py-2 w-fit"
          size="large"
        >
          Купить
        </Button>
      </div>
    </div>
  )
}

export default Hero
