import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
        <footer className="py-4 px-8 text-center text-sm text-gray-500 border-t mt-auto">
          <div className="container mx-auto">
            <div className="flex justify-center space-x-4">
              <a href="/api-docs" className="hover:text-black transition-colors">
                API Документация
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
