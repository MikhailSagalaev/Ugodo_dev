'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { Heading, RadioGroup, Button, Input, Label } from "@medusajs/ui"
import { ChevronDown, ChevronUp, FilterIcon, X } from "lucide-react"
import { SortOptions as ProductSortOptions } from "@lib/data/products" // Импортируем наш тип сортировки
import { HttpTypes } from "@medusajs/types"

interface ProductFiltersProps {
  categories: HttpTypes.StoreProductCategory[]; // Упрощенный тип
  types: Array<{ id: string; value: string }>; // Пока не используется, но оставим
  tags: Array<{ id: string; value: string }>;  // Пока не используется, но оставим
  priceRange: { min: number; max: number };
  searchParams: Record<string, any>; // Получаем текущие параметры поиска
}

// Компонент для сворачиваемых секций
const CollapsibleSection = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // Для мобильных можно добавить отдельную логику открытия/закрытия по умолчанию

  return (
    <div className="border-b border-ui-border-base pb-4 mb-6">
      <button
        className="flex justify-between items-center w-full py-2 text-left text-ui-fg-subtle hover:text-ui-fg-base"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Heading level="h3" className="text-base font-medium">{title}</Heading>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
      {isOpen && <div className="pt-4 space-y-3">{children}</div>}
    </div>
  );
};

// Основной компонент фильтров
const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  priceRange,
  searchParams,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams(); // Для получения текущих параметров из URL

  const активныеФильтрыПоУмолчанию = {
    category: searchParams?.category || "",
    min_price: searchParams?.min_price || priceRange.min.toString(),
    max_price: searchParams?.max_price || priceRange.max.toString(),
    sortBy: (searchParams?.sortBy as ProductSortOptions) || "created_at",
  };

  const [currentCategory, setCurrentCategory] = useState(активныеФильтрыПоУмолчанию.category);
  const [minPrice, setMinPrice] = useState(активныеФильтрыПоУмолчанию.min_price);
  const [maxPrice, setMaxPrice] = useState(активныеФильтрыПоУмолчанию.max_price);
  const [currentSortBy, setCurrentSortBy] = useState<ProductSortOptions>(активныеФильтрыПоУмолчанию.sortBy);

  // Обновление состояния, если searchParams изменились (например, при навигации назад/вперед)
  useEffect(() => {
    setCurrentCategory(currentSearchParams.get("category") || "");
    setMinPrice(currentSearchParams.get("min_price") || priceRange.min.toString());
    setMaxPrice(currentSearchParams.get("max_price") || priceRange.max.toString());
    setCurrentSortBy((currentSearchParams.get("sortBy") as ProductSortOptions) || "created_at");
  }, [currentSearchParams, priceRange]);

  const updateQueryParams = (paramsToUpdate: Record<string, string>) => {
    const newParams = new URLSearchParams(currentSearchParams.toString());
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === "" || (key === "min_price" && value === priceRange.min.toString()) || (key === "max_price" && value === priceRange.max.toString())) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    newParams.delete("page"); // Сбрасываем на первую страницу при изменении фильтров/сортировки
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (value: string) => {
    setCurrentCategory(value);
    updateQueryParams({ category: value });
  };

  const handleSortChange = (value: string) => {
    setCurrentSortBy(value as ProductSortOptions);
    updateQueryParams({ sortBy: value });
  };
  
  const handlePriceApply = () => {
    updateQueryParams({ min_price: minPrice, max_price: maxPrice });
  };
  
  const resetFilters = () => {
    setCurrentCategory("");
    setMinPrice(priceRange.min.toString());
    setMaxPrice(priceRange.max.toString());
    setCurrentSortBy("created_at");
    router.push(pathname, { scroll: false });
  };

  const sortOptions: { value: ProductSortOptions; label: string }[] = [
    { value: "created_at", label: "Новинки" },
    { value: "price_asc", label: "Цена: по возрастанию" },
    { value: "price_desc", label: "Цена: по убыванию" },
    { value: "name_asc", label: "Название: А-Я" }, 
    { value: "name_desc", label: "Название: Я-А" },
  ];
  
  // Состояние для мобильных фильтров
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const FiltersContent = () => (
    <div className="space-y-6">
      <CollapsibleSection title="Категории">
        <RadioGroup value={currentCategory} onValueChange={handleCategoryChange} className="space-y-2">
          <div key="all-cat" className="flex items-center space-x-2">
            <RadioGroup.Item id="all-cat-radio" value="" checked={currentCategory === ""} />
            <Label htmlFor="all-cat-radio" className="text-sm font-normal hover:cursor-pointer">Все категории</Label>
          </div>
          {categories.filter(c => !c.parent_category_id).map((category) => (
             <div key={category.id} className="flex items-center space-x-2">
                <RadioGroup.Item id={category.handle} value={category.handle} checked={currentCategory === category.handle} />
                <Label htmlFor={category.handle} className="text-sm font-normal hover:cursor-pointer">{category.name}</Label>
              </div>
            // TODO: Добавить отображение вложенных категорий, если нужно
          ))}
        </RadioGroup>
      </CollapsibleSection>

      <CollapsibleSection title="Цена">
        <div className="flex items-end gap-x-3">
          <div className="flex-1">
            <Label htmlFor="min-price" className="text-xs text-ui-fg-muted mb-1 block">От</Label>
            <Input 
              id="min-price" 
              type="number" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={priceRange.min.toString()} 
              min={priceRange.min}
              max={parseInt(maxPrice) || priceRange.max}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="text-ui-fg-muted">-</div>
          <div className="flex-1">
            <Label htmlFor="max-price" className="text-xs text-ui-fg-muted mb-1 block">До</Label>
            <Input 
              id="max-price" 
              type="number" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={priceRange.max.toString()} 
              min={parseInt(minPrice) || priceRange.min}
              max={priceRange.max}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <Button onClick={handlePriceApply} className="mt-4 w-full" variant="secondary">Применить цену</Button>
      </CollapsibleSection>

      {/* TODO: Добавить фильтры по типам и тегам, если нужно */}

      <Button onClick={resetFilters} variant="secondary" className="w-full">Сбросить все фильтры</Button>
    </div>
  );

  // Временная замена Select на HTML select
  const NativeSelectSort = ({ id, value, onChange, options, label }: {
    id: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    label: string;
  }) => (
    <div>
      <Label htmlFor={id} className="text-sm text-ui-fg-muted mb-1">{label}</Label>
      <select 
        id={id} 
        value={value} 
        onChange={onChange} 
        className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-field hover:bg-ui-bg-field-hover focus:border-ui-border-interactive focus:ring-ui-focus focus:ring-2 text-ui-fg-base text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <aside className="w-full md:w-1/4 lg:w-1/5">
      {/* Desktop Filters and Sort */}
      <div className="hidden md:block space-y-8">
        <NativeSelectSort 
          id="sort-by-desktop"
          value={currentSortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          options={sortOptions}
          label="Сортировать по"
        />
        <FiltersContent />
      </div>

      {/* Mobile Filters Button and Drawer/Modal */}
      <div className="md:hidden">
        <Button 
          variant="secondary"
          onClick={() => setMobileFiltersOpen(true)} 
          className="w-full flex items-center justify-center gap-x-2 mb-4"
        >
          <FilterIcon size={18}/> Фильтры и сортировка
        </Button>
        
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 right-0 h-full w-full max-w-sm bg-ui-bg-base shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-ui-border-base">
                <Heading level="h3">Фильтры</Heading>
                <Button variant="transparent" onClick={() => setMobileFiltersOpen(false)} className="p-1">
                  <X size={24} />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto flex-grow space-y-8">
                <NativeSelectSort 
                  id="sort-by-mobile"
                  value={currentSortBy}
                  onChange={(e) => {
                    handleSortChange(e.target.value);
                    setMobileFiltersOpen(false);
                  }}
                  options={sortOptions}
                  label="Сортировать по"
                />
                <FiltersContent />
              </div>
              <div className="p-4 border-t border-ui-border-base">
                <Button onClick={() => { resetFilters(); setMobileFiltersOpen(false);}} variant="secondary" className="w-full mb-2">Сбросить</Button>
                <Button onClick={() => setMobileFiltersOpen(false)} className="w-full">Показать товары</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProductFilters; 