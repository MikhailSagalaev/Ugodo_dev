import type { 
  MedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import { createReviewWorkflow } from "../../../workflows/create-review"

export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  try {
    const reviewData = req.body
    
    const { result: review } = await createReviewWorkflow(req.scope)
      .run({
        input: reviewData,
      })
    
    res.status(201).json({
      review,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
} 