import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  availableValues?: string[]
  disabled?: boolean
  'data-testid'?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  availableValues,
  'data-testid': dataTestid,
  disabled,
}) => {
  const filteredOptions = option.values?.map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Выберите {title}</span>
      <div
        className="flex flex-wrap justify-start gap-2"
        data-testid={dataTestid}
      >
        {filteredOptions?.map((v) => {
          const isAvailable = !availableValues || availableValues.includes(v);
          const unavailableStyle = !isAvailable ? "text-gray-400 cursor-not-allowed opacity-50" : "cursor-pointer";

          return (
            <button
              onClick={() => {
                if (isAvailable) {
                  updateOption(option.id, v)
                }
              }}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1 basis-auto outline-none",
                {
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current && isAvailable,
                },
                 unavailableStyle
              )}
              disabled={disabled || !isAvailable}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect 