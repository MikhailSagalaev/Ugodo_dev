import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IAuthModuleService } from "@medusajs/types";

/**
 * Middleware для проверки аутентификации администратора
 */
export function authenticateAdmin(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction): void {
  // Используем встроенный authenticate middleware от Medusa для "admin" scope.
  // Он автоматически проверит JWT из заголовков или куки и добавит req.auth_context
  // или вернет 401, если аутентификация не удалась.
  // Нам не нужно вручную получать сервис и проверять токен.
  // Этот middleware должен быть зарегистрирован в глобальных или групповых middlewares.

  // Если встроенный authenticate middleware не используется, или нужна кастомная логика:
  /*
  try {
    const authService = req.scope.resolve<IAuthModuleService>("authModuleService");
    const authIdentity = await authService.authenticate("admin", req);

    if (!authIdentity || !authIdentity.actor_id) {
      res.status(401).json({ message: "Необходима аутентификация администратора" });
      return;
    }

    // Можно добавить actor_id или другие данные в req, если нужно
    // req.admin_user_id = authIdentity.actor_id;

    next();
  } catch (error) {
    console.error("Ошибка аутентификации администратора:", error);
    res.status(401).json({ message: "Ошибка аутентификации" });
  }
  */

  // Пример: Проверяем, есть ли req.auth_context после работы встроенного middleware
  const reqAny = req as any;
  if (!reqAny.auth_context || reqAny.auth_context.actor_type !== 'user' || reqAny.auth_context.scope !== 'admin') {
    res.status(401).json({ message: "Необходима аутентификация администратора" });
    return;
  }

  // Администратор аутентифицирован, можно добавить его ID в req для удобства
  reqAny.user_id = reqAny.auth_context.actor_id;

  next()
} 