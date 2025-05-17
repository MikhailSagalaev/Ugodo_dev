import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-mode="light" suppressHydrationWarning={true}>
      <body>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  )
}
