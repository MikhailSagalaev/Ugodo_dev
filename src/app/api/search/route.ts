import { NextResponse } from 'next/server'
// import { medusajs } from '@lib/config'; // Удаляем этот импорт
import { HttpTypes } from '@medusajs/types';
import { sdk } from '@lib/sdk'; // Импортируем sdk напрямую

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  // TODO: Определить, как получать region_id. 
  // Пока что, для простоты, можно попробовать без него или использовать дефолтный, 
  // если ваш Medusa настроен так.
  // const regionId = searchParams.get('region_id'); 

  try {
    // Используем Record<string, any> для params, чтобы обойти строгость типа StoreProductParams
    // для параметра 'q', но сохраняем типизацию для известных параметров.
    const params: Record<string, any> & Pick<HttpTypes.StoreProductParams, 'limit' | 'region_id'> = { 
      q: query, 
      limit: 10, // Лимит для выпадающего списка
      // region_id: regionId || undefined, // Раскомментировать, если region_id будет передаваться
    };
    
    if (!sdk || !sdk.store || !sdk.store.product) {
        throw new Error('Medusa SDK or store.product API is not available.');
    }

    // sdk.store.product.list ожидает HttpTypes.StoreProductParams.
    // Мы передаем объект, который совместим благодаря Record<string, any>,
    // но для большей безопасности можно явно привести к нужному типу, если необходимо.
    // Однако, Record<string, any> часто используется для таких случаев.
    const { products } = await sdk.store.product.list(params as HttpTypes.StoreProductParams);

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: 'Failed to fetch search results', details: errorMessage }, { status: 500 })
  }
} 