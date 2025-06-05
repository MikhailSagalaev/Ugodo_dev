import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Text, toast, Badge, Input } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"

type VideoData = {
  id: string
  product_id: string
  type: string
  filename: string
  mimeType: string
  size: number
  url: string
  title?: string
  description?: string
  thumbnail_url?: string
  duration?: number
  created_at: string
}

type VideoUploadData = {
  type: string
  title: string
  description: string
}

const ProductVideoManager = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState<VideoUploadData>({
    type: 'main',
    title: '',
    description: ''
  })

  // Загружаем список видео при монтировании компонента
  useEffect(() => {
    if (data.id) {
      fetchVideos()
    }
  }, [data.id])

  const fetchVideos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/admin/products/${data.id}/videos`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setVideos(result.videos || [])
      } else {
        console.error('Failed to fetch videos:', response.status, response.statusText)
        if (response.status === 401) {
          toast.error('Ошибка аутентификации')
        } else {
          toast.error('Не удалось загрузить видео')
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки видео:', error)
      toast.error('Не удалось загрузить видео')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Проверяем тип файла
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Неподдерживаемый тип видеофайла')
        return
      }
      
      // Проверяем размер файла (100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 100MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки')
      return
    }

    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('video', selectedFile)
      formData.append('product_id', data.id)
      formData.append('type', uploadData.type)
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)

      const response = await fetch('/admin/product-videos/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Видео успешно загружено!')
        setSelectedFile(null)
        setUploadData({ type: 'main', title: '', description: '' })
        // Сбрасываем input file
        const fileInput = document.getElementById('video-file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Обновляем список видео
        await fetchVideos()
      } else {
        const errorText = await response.text()
        console.error('Upload failed:', response.status, errorText)
        
        let errorMessage = 'Ошибка при загрузке видео'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          // Error text is not JSON, use default message
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      toast.error('Произошла ошибка при загрузке')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это видео?')) {
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch(`/admin/product-videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        toast.success('Видео удалено!')
        await fetchVideos()
      } else {
        console.error('Delete failed:', response.status)
        toast.error('Не удалось удалить видео')
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
      toast.error('Произошла ошибка при удалении')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      main: 'Основное',
      preview: 'Превью',
      demo: 'Демо',
      tutorial: 'Обучение'
    }
    return types[type] || type
  }

  return (
    <Container className="px-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Heading level="h2">Видео товара</Heading>
          <Text className="text-ui-fg-subtle">
            Управление видеофайлами для товара {data.title}
          </Text>
        </div>
        <Badge color="grey">
          {videos.length} видео
        </Badge>
      </div>

      {/* Форма загрузки */}
      <div className="border rounded-lg p-4 mb-6 bg-ui-bg-subtle">
        <Heading level="h3" className="mb-4">Загрузить новое видео</Heading>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Text className="text-sm font-medium mb-2">Тип видео</Text>
            <select 
              value={uploadData.type}
              onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="main">Основное</option>
              <option value="preview">Превью</option>
              <option value="demo">Демо</option>
              <option value="tutorial">Обучение</option>
            </select>
          </div>
          
          <div>
            <Text className="text-sm font-medium mb-2">Файл</Text>
            <input
              id="video-file-input"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Название видео"
            value={uploadData.title}
            onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
          />
          <Input
            placeholder="Описание"
            value={uploadData.description}
            onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
          />
        </div>

        {selectedFile && (
          <div className="mb-4 p-3 bg-ui-bg-base border rounded">
            <Text className="text-sm">
              Выбран файл: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
            </Text>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={isLoading || !selectedFile}
          className="w-full"
        >
          {isLoading ? 'Загрузка...' : 'Загрузить видео'}
        </Button>

        <Text className="text-xs text-ui-fg-muted mt-2">
          Поддерживаемые форматы: MP4, WebM, OGG, AVI, MOV. Максимальный размер: 100MB
        </Text>
      </div>

      {/* Список видео */}
      <div>
        <Heading level="h3" className="mb-4">Загруженные видео</Heading>
        
        {isLoading && <Text>Загрузка...</Text>}
        
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-8 text-ui-fg-muted">
            <Text>Видео не найдены</Text>
          </div>
        )}

        {!isLoading && videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-lg p-4 bg-ui-bg-base">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Text className="font-medium">{video.title || video.filename}</Text>
                      <Badge color="grey">
                        {getTypeLabel(video.type)}
                      </Badge>
                    </div>
                    
                    {video.description && (
                      <Text className="text-sm text-ui-fg-muted mb-2">{video.description}</Text>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-ui-fg-muted">
                      <span>Файл: {video.filename}</span>
                      <span>Размер: {formatFileSize(video.size)}</span>
                      <span>Тип: {video.mimeType}</span>
                      {video.duration && <span>Длительность: {Math.round(video.duration)}с</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      Просмотр
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteVideo(video.id)}
                      disabled={isLoading}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductVideoManager 