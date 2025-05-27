import { NextResponse } from 'next/server'
import { listCategories } from '@lib/data/categories'

export async function GET() {
  try {
    console.log('🔍 Запрос категорий...')
    const categories = await listCategories()
    console.log('📦 Получено категорий:', categories?.length || 0)
    console.log('📋 Структура первой категории:', categories?.[0] ? {
      id: categories[0].id,
      name: categories[0].name,
      handle: categories[0].handle,
      parent_category_id: categories[0].parent_category_id,
      category_children: categories[0].category_children?.length || 0
    } : 'Нет категорий')
    console.log('📊 Все категории:', categories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      handle: cat.handle,
      parent_category_id: cat.parent_category_id,
      children_count: cat.category_children?.length || 0
    })))
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('❌ Ошибка при загрузке категорий:', error)
    return NextResponse.json([], { status: 200 })
  }
} 