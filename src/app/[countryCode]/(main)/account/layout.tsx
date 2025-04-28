import { retrieveCustomer } from "@lib/data/customer"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  console.log("[AccountPageLayout] Retrieving customer...");
  const customer = await retrieveCustomer().catch(() => {
    console.error("[AccountPageLayout] Failed to retrieve customer.");
    return null;
  });
  console.log("[AccountPageLayout] Customer status:", customer);
  console.log(`[AccountPageLayout] Rendering slot: ${customer ? 'dashboard' : 'login'}`);

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
      <Toaster />
    </AccountLayout>
  )
}
