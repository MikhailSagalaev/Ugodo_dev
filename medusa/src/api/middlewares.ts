import { 
  defineMiddlewares,
  authenticate,
  validateAndTransformBody, 
  validateAndTransformQuery
} from "@medusajs/framework/http"
import { PostAdminUpdateReviewsStatusSchema } from "./admin/reviews/status/route"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route"
import { GetAdminReviewsSchema } from "./admin/reviews/route"
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
      cb(null, true)
    } else {
      cb(new Error(`Тип файла ${file.mimetype} не поддерживается. Разрешены только изображения и видео.`))
    }
  }
})

// Configure multer for video uploads
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Неподдерживаемый тип видеофайла'))
    }
  }
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/reviews",
      method: ["POST"], 
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(PostStoreReviewSchema)
      ]
    }, 
    {
      matcher: "/store/products/:id/reviews",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetStoreReviewsSchema, {
          isList: true,
          defaults: ["id", "rating", "title", "first_name", "last_name", "content", "created_at"]
        })
      ]
    },
    {
      matcher: "/admin/reviews",
      method: ["GET"],
      middlewares: [
        validateAndTransformQuery(GetAdminReviewsSchema, {
          isList: true,
          defaults: [
            "id",
            "title",
            "content",
            "rating",
            "product_id",
            "customer_id",
            "status",
            "created_at",
            "updated_at",
            "product.*",
          ]
        })
      ]
    },
    {
      matcher: "/admin/reviews/status",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PostAdminUpdateReviewsStatusSchema)
      ]
    },
    {
      matcher: "/admin/products/*/media",
      method: "POST",
      middlewares: [
        upload.array("files"),
      ],
    },
    {
      matcher: "/admin/product-videos/upload",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"]), videoUpload.single('video')],
    },
    {
      matcher: "/admin/product-videos/*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
    {
      matcher: "/admin/products/*/videos",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
  ]
})


