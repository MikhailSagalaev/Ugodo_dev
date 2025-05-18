import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"
import { HttpTypes } from "@medusajs/types"

const RUSSIAN_CITIES = [
  { value: "moscow", label: "Москва" },
  { value: "saint-petersburg", label: "Санкт-Петербург" },
  { value: "novosibirsk", label: "Новосибирск" },
  { value: "yekaterinburg", label: "Екатеринбург" },
  { value: "kazan", label: "Казань" },
  { value: "nizhny-novgorod", label: "Нижний Новгород" },
  { value: "chelyabinsk", label: "Челябинск" },
  { value: "samara", label: "Самара" },
  { value: "omsk", label: "Омск" },
  { value: "rostov-on-don", label: "Ростов-на-Дону" },
  { value: "ufa", label: "Уфа" },
  { value: "krasnoyarsk", label: "Красноярск" },
  { value: "voronezh", label: "Воронеж" },
  { value: "perm", label: "Пермь" },
  { value: "volgograd", label: "Волгоград" },
]

const CitySelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps
>(({ placeholder = "Город", defaultValue, ...props }, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null)

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current
  )

  const cityOptions = useMemo(() => {
    return RUSSIAN_CITIES
  }, [])

  return (
    <NativeSelect
      ref={innerRef}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...props}
    >
      {cityOptions?.map(({ value, label }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </NativeSelect>
  )
})

CitySelect.displayName = "CitySelect"

export default CitySelect 