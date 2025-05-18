"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"
import { Customer } from "@medusajs/medusa"

// Тип для ответа нашего API Route Handler /api/customer/me
type ApiCustomerResponse = {
    customer: Omit<Customer, "password_hash">;
}

/**
 * Получает данные текущего авторизованного покупателя напрямую через Medusa SDK.
 * Возвращает данные покупателя или null, если не авторизован или произошла ошибка.
 */
export async function retrieveCustomer(): Promise<Omit<
  HttpTypes.StoreCustomer,
  "password_hash"
> | null> {
  const headers = await getAuthHeaders().catch(() => {
      // Если getAuthHeaders выбросит ошибку (например, нет токена), возвращаем null
      console.warn("Не удалось получить заголовки аутентификации для retrieveCustomer.");
      return null;
  });

  // Если заголовки получить не удалось (нет токена), пользователь не авторизован
  if (!headers) {
            return null;
        }

  try {
    // Используем sdk напрямую с полученными заголовками
    const { customer } = await sdk.store.customer.retrieve(
        { fields: "*orders" }, // Запрашиваем нужные поля, можно настроить
        headers
    );
    return customer;
    } catch (error: any) {
    // Medusa SDK обычно выбрасывает ошибки при 401 или других проблемах
    let errorMessage = "Unknown error retrieving customer data";
    if (error instanceof Error) {
        // Пытаемся получить сообщение из medusaError, если это ошибка Medusa
        // или используем стандартное сообщение ошибки
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        // Попытка получить сообщение, если это объект с полем message
        errorMessage = error?.message || errorMessage;
    }
    console.error("Ошибка получения данных покупателя через Medusa SDK:", errorMessage);
    // Очищаем токен, если он невалидный (например, 401 Unauthorized)
    if (error?.response?.status === 401) {
        await removeAuthToken();
    }
        return null;
    }
}

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

// Wishlist API functions

// Получить customer_id
async function getCustomerId(): Promise<string | null> {
  const customer = await retrieveCustomer()
  return customer?.id || null
}

// Тип для элемента избранного (требуется адаптация под ваш API)
interface WishlistItem /* extends HttpTypes.StoreWishlistItem */ { // Убираем наследование от несуществующего типа
  id: string; // Обязательное поле
  product_id?: string; // Вероятное поле
  // Добавьте другие поля, если API возвращает больше данных
  product?: HttpTypes.StoreProduct // Может возвращаться информация о продукте
}

// Тип для ответа API списка избранного (требуется адаптация)
interface WishlistResponse {
  wishlist: {
    id: string;
    customer_id: string;
    region_id: string;
    items: WishlistItem[]; // Используем наш интерфейс
    created_at: string;
    updated_at: string;
    // Добавьте другие поля, если API их возвращает
  };
}

/**
 * Получить список избранного пользователя
 */
export const getWishlist = async (): Promise<WishlistItem[]> => {
  const headers = await getAuthHeaders();
  const customer_id = await getCustomerId();
  if (!headers || !customer_id) return [];

  const next = {
    ...(await getCacheOptions("wishlist")),
    tags: ["wishlist"], // Тег для ревалидации
  };

  try {
    const response = await sdk.client.fetch<WishlistResponse>(
      `/store/customers/${customer_id}/wishlist`,
      {
        method: "GET",
        headers,
        next,
        cache: "force-cache",
      }
    );
    return response.wishlist?.items || [];
  } catch (error) {
    console.error("Ошибка получения избранного:", error);
    return [];
  }
};

/**
 * Добавить товар в избранное
 */
export const addToWishlist = async (productId: string): Promise<boolean> => {
  const headers = await getAuthHeaders();
  const customer_id = await getCustomerId();
  if (!headers || !customer_id) return false;

  try {
    await sdk.client.fetch(`/store/customers/${customer_id}/wishlist`, {
      method: "POST",
      headers,
      body: { product_id: productId },
      cache: "no-store",
    });
    revalidateTag("wishlist");
    return true;
  } catch (error) {
    console.error(`Ошибка добавления товара ${productId} в избранное:`, error);
    return false;
  }
};

/**
 * Удалить товар из избранного
 */
export const removeFromWishlist = async (itemId: string): Promise<boolean> => {
  const headers = await getAuthHeaders();
  const customer_id = await getCustomerId();
  if (!headers || !customer_id) return false;

  try {
    await sdk.client.fetch(
      `/store/customers/${customer_id}/wishlist/${itemId}`,
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      }
    );
    revalidateTag("wishlist");
    return true;
  } catch (error) {
    console.error(`Ошибка удаления элемента ${itemId} из избранного:`, error);
    return false;
  }
};
