export default function VideoTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Тест видео</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">1. Десктоп видео с controls:</h2>
        <video width="800" height="400" controls>
          <source src="/video/banners/0526-pc.mp4" type="video/mp4" />
          Видео не поддерживается
        </video>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">2. Десктоп видео без размеров:</h2>
        <video controls>
          <source src="/video/banners/0526-pc.mp4" type="video/mp4" />
          Видео не поддерживается
        </video>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">3. Десктоп видео с preload none:</h2>
        <video controls preload="none">
          <source src="/video/banners/0526-pc.mp4" type="video/mp4" />
          Видео не поддерживается
        </video>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">4. Десктоп видео через API роут:</h2>
        <video controls>
          <source src="/api/video/banners/0526-pc.mp4" type="video/mp4" />
          Видео не поддерживается
        </video>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">5. Мобильное видео (работает):</h2>
        <video width="400" height="600" controls>
          <source src="/video/banners/0526-mobile.mp4" type="video/mp4" />
          Видео не поддерживается
        </video>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">6. Десктоп видео с poster:</h2>
        <video controls poster="/video/banners/0526-mobile.mp4">
          <source src="/video/banners/0526-pc.mp4" type="video/mp4" />
          Видео не поддерживается
        </video>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">Прямые ссылки:</h2>
        <p><a href="/video/banners/0526-pc.mp4" target="_blank" className="text-blue-500">Десктоп видео (прямая ссылка)</a></p>
        <p><a href="/video/banners/0526-mobile.mp4" target="_blank" className="text-blue-500">Мобильное видео (прямая ссылка)</a></p>
        <p><a href="/api/video/banners/0526-pc.mp4" target="_blank" className="text-blue-500">Десктоп видео через API</a></p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">Информация о файлах:</h2>
        <p>Размер десктоп видео: ~6MB</p>
        <p>Размер мобильного видео: ~4.5MB</p>
      </div>
    </div>
  )
} 