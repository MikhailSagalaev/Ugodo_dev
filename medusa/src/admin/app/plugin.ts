import { definePlugin } from "@medusajs/admin-sdk"
import type { LiftProps } from "@medusajs/admin-sdk"

export const BANNERS_PERMISSION_GROUP = {
  label: "Баннеры",
  value: "banners",
  permissions: [
    {
      label: "Просмотр",
      value: "view",
    },
    {
      label: "Создание",
      value: "create",
    },
    {
      label: "Редактирование",
      value: "edit",
    },
    {
      label: "Удаление",
      value: "delete",
    },
  ],
}

export const lift = (props: LiftProps) => {
  return definePlugin({
    name: "Управление баннерами",
    visitor: {
      configurePermissionGroups: ({ permissionGroups }) => {
        return [...permissionGroups, BANNERS_PERMISSION_GROUP]
      },
    },
    render: props.children,
  })
}

export default lift 