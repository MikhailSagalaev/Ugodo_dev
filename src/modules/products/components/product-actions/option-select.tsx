import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

// Вспомогательная функция для преобразования названий цветов в HEX или CSS классы
// Добавьте больше цветов по мере необходимости
const getColorStyle = (value: string): React.CSSProperties => {
  const lowerValue = value.toLowerCase();
  switch (lowerValue) {
    case "black": return { backgroundColor: "#000000" };
    case "white": return { backgroundColor: "#FFFFFF", border: '1px solid #e5e7eb' }; // Добавим рамку для белого
    case "gray": return { backgroundColor: "#808080" };
    case "red": return { backgroundColor: "#FF0000" };
    case "green": return { backgroundColor: "#008000" };
    case "blue": return { backgroundColor: "#0000FF" };
    // Можно добавить обработку HEX кодов, если они приходят
    // if (/^#[0-9A-F]{6}$/i.test(value)) { return { backgroundColor: value }; }
    default: return { backgroundColor: value }; // Попытка использовать значение как есть
  }
};

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled?: boolean
  availabilityMap?: Record<string, boolean>
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  availabilityMap,
  "data-testid": dataTestId,
}) => {
  // Проверяем, является ли опция опцией цвета (регистронезависимо)
  const isColorOption = title.toLowerCase() === 'color' || title.toLowerCase() === 'цвет';

  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div
        className={clx("flex flex-wrap gap-2", {
          "justify-between": !isColorOption, // Растягиваем кнопки для не-цветов
          "justify-start": isColorOption // Выравниваем цвета по левому краю
        })}
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
           const isSelected = v === current;
           // Определяем доступность для этого значения
           const isAvailable = availabilityMap ? availabilityMap[v] !== false : true; // Считаем доступным, если карта не передана или значение true/undefined
           
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border-ui-border-base border text-small-regular rounded-rounded p-0.5 min-w-[45px] h-[45px] transition-all duration-200 ease-in-out", // Общий размер и стиль рамки
                {
                  // Стили для не-цветовых опций
                  "bg-ui-bg-subtle flex-1 max-w-[100px]": !isColorOption, // Фон и ширина для текста
                  "hover:bg-ui-bg-field-hover": !isColorOption && !isSelected && isAvailable,
                   // Стили для цветовых опций
                  "w-[45px] flex items-center justify-center": isColorOption, // Фиксированный размер для квадрата цвета
                  // Общие стили для выделения
                  "ring-2 ring-offset-1 ring-ui-border-interactive shadow-md": isSelected && isAvailable, // Выделяем только доступные
                  // Стили для недоступных
                  "opacity-50 cursor-not-allowed": !isAvailable,
                   // Стили при наведении (только для доступных)
                  "hover:ring-1 hover:ring-ui-border-base": !isSelected && isAvailable,
                }
              )}
              disabled={!isAvailable} // Блокируем кнопку, если не доступно
              data-testid={`option-button-${v}`}
              title={`${v}${!isAvailable ? ' (нет в наличии)' : ''}`} // Обновляем title
            >
              {isColorOption ? (
                <span 
                  className="block w-full h-full rounded-full" // Внутренний блок для цвета
                  style={getColorStyle(v)} 
                />
              ) : (
                v // Отображаем текст для не-цветовых опций
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
