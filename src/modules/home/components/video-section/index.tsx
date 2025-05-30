'use client'

const VideoSection = () => {
  return (
    <div className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          <video
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/video/banners/0526-pc.mp4" type="video/mp4" />
            <source src="/video/banners/0526-mobile.mp4" type="video/mp4" />
            Ваш браузер не поддерживает видео
          </video>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-2">UGODO 2024</h2>
              <p className="text-lg md:text-xl">Новая коллекция</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoSection 