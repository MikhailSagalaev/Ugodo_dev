/**
 * @swagger
 * components:
 *   schemas:
 *     TestModel:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор объекта
 *         name:
 *           type: string
 *           description: Название объекта
 *         description:
 *           type: string
 *           description: Описание объекта
 */

// Этот файл используется только для определения схемы в Swagger
export type TestModel = {
  id: string
  name: string
  description?: string
} 