"use server"
import { cookies as nextCookies } from "next/headers"
import { redirect } from "next/navigation"

export async function resetOnboardingState(orderId: string) {
  try {
    const cookies = await nextCookies()
    cookies.set("_medusa_onboarding", "false", { maxAge: -1 })
    redirect(`http://localhost:7001/a/orders/${orderId}`)
  } catch (error) {
    console.warn("Не удалось сбросить состояние onboarding:", error);
    redirect(`http://localhost:7001/a/orders/${orderId}`)
  }
}
