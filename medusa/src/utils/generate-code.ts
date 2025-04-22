/**
 * Генерирует случайный код указанной длины
 * @param length Длина генерируемого кода (по умолчанию 6)
 * @returns Строка, содержащая случайные цифры
 */
export function generateRandomCode(length: number = 6): string {
  // Проверяем, что длина кода положительная
  if (length <= 0) {
    throw new Error("Длина кода должна быть положительным числом")
  }
  
  // Генерируем случайные цифры для кода
  let code = ""
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  
  return code
}

/**
 * Генерирует случайную строку из букв и цифр указанной длины
 * @param length Длина генерируемой строки (по умолчанию 10)
 * @returns Строка, содержащая случайные символы
 */
export function generateRandomString(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars.charAt(randomIndex)
  }
  
  return result
} 