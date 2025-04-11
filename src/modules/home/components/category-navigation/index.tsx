import LocalizedClientLink from "@modules/common/components/localized-client-link"

const categories = [
  {
    id: "cat_1",
    name: "Ванная",
    icon: "🛁",
    color: "bg-blue-400",
    handle: "bathroom",
  },
  {
    id: "cat_2",
    name: "Кухня",
    icon: "🍳",
    color: "bg-lime-400",
    handle: "kitchen",
  },
  {
    id: "cat_3",
    name: "Спальня",
    icon: "🛏️",
    color: "bg-white border",
    handle: "bedroom",
  },
  {
    id: "cat_4",
    name: "Гостиная",
    icon: "🛋️",
    color: "bg-yellow-400",
    handle: "living-room",
  },
  {
    id: "cat_5",
    name: "Декор",
    icon: "🏺",
    color: "bg-blue-400",
    handle: "decor",
  },
]

const CategoryNavigation = () => {
  return (
    <div className="flex justify-center gap-4 py-6">
      {categories.map((category) => (
        <LocalizedClientLink 
          key={category.id} 
          href={`/categories/${category.handle}`}
          className="flex flex-col items-center"
        >
          <div 
            className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-xl`}
          >
            {category.icon}
          </div>
          <span className="text-xs mt-1">{category.name}</span>
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default CategoryNavigation 