import { Metadata } from "next"
import DocumentsTemplate from "@modules/documents/templates"

export const metadata: Metadata = {
  title: "Документы",
  description: "Политика конфиденциальности, условия доставки, возврат товаров и другие документы интернет-магазина Ugodo",
}

export default function DocumentsPage() {
  return <DocumentsTemplate />
} 