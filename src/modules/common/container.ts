import { MedusaContainer } from "@medusajs/framework/types"

let container: MedusaContainer

export function setContainer(cont: MedusaContainer) {
  container = cont
}

export { container } 