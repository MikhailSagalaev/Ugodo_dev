import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB максимум для видео
    files: 10, // Максимум 10 файлов за раз
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем изображения и видео
    const allowedMimeTypes = [
      // Изображения
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      // Видео форматы
      'video/mp4',
      'video/webm',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/mkv',
      'video/3gp',
      'video/quicktime',
    ]
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      // Дополнительная проверка размера для разных типов
      const isVideo = file.mimetype.startsWith('video/')
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB для видео, 10MB для изображений
      
      cb(null, true)
    } else {
      cb(new Error(`Тип файла ${file.mimetype} не поддерживается. Разрешены только изображения и видео.`))
    }
  }
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/products/*/media",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ],
    },
  ],
}) 