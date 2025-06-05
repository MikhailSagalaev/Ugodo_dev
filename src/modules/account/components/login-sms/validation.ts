/**
 * @file: validation.ts
 * @description: Zod-схемы для валидации форм SMS OTP авторизации
 * @dependencies: zod
 * @created: 2024-06-11
 */

import { z } from 'zod'

export const phoneSchema = z.object({
  phone: z.string().min(10, 'Введите корректный номер телефона').max(20)
})

export const otpSchema = z.object({
  phone: z.string().min(10, 'Введите корректный номер телефона').max(20),
  otp: z.string().min(4, 'Код должен содержать минимум 4 цифры').max(8)
}) 