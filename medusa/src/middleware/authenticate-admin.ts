import { UserService } from "@medusajs/medusa"

/**
 * Middleware для проверки аутентификации администратора
 */
export default () => {
  return async (req, res, next) => {
    try {
      const jwt = req.session?.jwt

      if (!jwt) {
        res.status(401).json({
          message: "Необходима аутентификация",
        })
        return
      }

      try {
        const userService = req.scope.resolve("userService") as UserService
        const { getUserFromToken } = userService

        const user = await getUserFromToken(jwt)

        req.user = user
        next()
      } catch (err) {
        res.status(401).json({
          message: "Неверные учетные данные",
        })
        return
      }
    } catch (err) {
      next(err)
    }
  }
} 