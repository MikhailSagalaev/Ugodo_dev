import { 
  DropdownMenu,
  IconButton,
  clx,
} from "@medusajs/ui"
import { EllipsisHorizontal } from "@medusajs/icons"
import { Link } from "react-router-dom"

export type Action = {
  icon?: React.ReactNode
  label: string
  disabled?: boolean
  variant?: "danger" | "normal"
} & (
  | {
      to: string
      onClick?: never
    }
  | {
      onClick: () => void
      to?: never
    }
)

export type ActionGroup = {
  actions: Action[]
}

export type ActionMenuProps = {
  groups: ActionGroup[]
}

export const ActionMenu = ({ groups }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="small" variant="transparent">
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {groups.map((group, index) => {
          if (!group.actions.length) {
            return null
          }

          const isLast = index === groups.length - 1

          return (
            <DropdownMenu.Group key={index}>
              {group.actions.map((action, actionIndex) => {
                if (action.onClick) {
                  return (
                    <DropdownMenu.Item
                      disabled={action.disabled}
                      key={actionIndex}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick()
                      }}
                      className={clx(
                        "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                        {
                          "[&_svg]:text-ui-fg-disabled": action.disabled,
                          "text-ui-fg-error": action.variant === "danger",
                        }
                      )}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </DropdownMenu.Item>
                  )
                }

                return (
                  <Link to={action.to} key={actionIndex}>
                    <DropdownMenu.Item
                      disabled={action.disabled}
                      className={clx(
                        "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                        {
                          "[&_svg]:text-ui-fg-disabled": action.disabled,
                          "text-ui-fg-error": action.variant === "danger",
                        }
                      )}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </DropdownMenu.Item>
                  </Link>
                )
              })}
              {!isLast && <DropdownMenu.Separator />}
            </DropdownMenu.Group>
          )
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
} 