/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API управления отзывами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор отзыва
 *         title:
 *           type: string
 *           description: Заголовок отзыва
 *         content:
 *           type: string
 *           description: Содержание отзыва
 *         rating:
 *           type: number
 *           description: Рейтинг (от 1 до 5)
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Статус отзыва
 *         product_id:
 *           type: string
 *           description: ID товара
 *         customer_id:
 *           type: string
 *           description: ID клиента
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Дата обновления
 */

/**
 * @swagger
 * /store/reviews:
 *   get:
 *     summary: Получить список отзывов
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Фильтр по ID товара
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список отзывов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *   post:
 *     summary: Создать новый отзыв
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - content
 *               - rating
 *               - first_name
 *               - last_name
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               product_id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               customer_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Созданный отзыв
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * /store/reviews/{id}:
 *   get:
 *     summary: Получить отзыв по ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID отзыва
 *     responses:
 *       200:
 *         description: Отзыв
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * /store/products/{id}/reviews:
 *   get:
 *     summary: Получить отзывы для товара
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество отзывов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список отзывов для товара
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * /store/products/{id}/reviews/stats:
 *   get:
 *     summary: Получить статистику отзывов для товара
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Статистика отзывов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product_id:
 *                   type: string
 *                 average_rating:
 *                   type: number
 *                 rating_count:
 *                   type: integer
 *                 ratings_distribution:
 *                   type: object
 *                   properties:
 *                     "1":
 *                       type: integer
 *                     "2":
 *                       type: integer
 *                     "3":
 *                       type: integer
 *                     "4":
 *                       type: integer
 *                     "5":
 *                       type: integer
 */

/**
 * @swagger
 * /admin/reviews:
 *   get:
 *     summary: Получить список всех отзывов (админ)
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Фильтр по ID товара
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Фильтр по статусу
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Количество отзывов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список всех отзывов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 count:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */

/**
 * @swagger
 * /admin/reviews/{id}:
 *   get:
 *     summary: Получить отзыв по ID (админ)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID отзыва
 *     responses:
 *       200:
 *         description: Отзыв
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *   put:
 *     summary: Обновить отзыв (админ)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID отзыва
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Обновленный отзыв
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *   delete:
 *     summary: Удалить отзыв (админ)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID отзыва
 *     responses:
 *       204:
 *         description: Отзыв удален
 */

/**
 * @swagger
 * /admin/reviews/{id}/approve:
 *   post:
 *     summary: Одобрить отзыв (админ)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID отзыва
 *     responses:
 *       200:
 *         description: Отзыв одобрен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * /admin/reviews/{id}/reject:
 *   post:
 *     summary: Отклонить отзыв (админ)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID отзыва
 *     responses:
 *       200:
 *         description: Отзыв отклонен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 */

// Этот файл не содержит реальных маршрутов, это только документация
export {} 