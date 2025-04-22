import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { REVIEW_MODULE } from "../modules/review"

type CreateReviewWorkflowInput = {
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  product_id: string
  customer_id?: string
}

const createReviewStep = createStep(
  "create-review",
  async (data: CreateReviewWorkflowInput, { container }) => {
    const reviewService = container.resolve(REVIEW_MODULE)

    const review = await reviewService.createReviews({
      ...data,
      status: "pending", // Все новые отзывы ожидают модерации
    })

    return new StepResponse(review, review)
  },
  async (review, { container }) => {
    const reviewService = container.resolve(REVIEW_MODULE)

    await reviewService.deleteReview(review.id)
  }
)

export const createReviewWorkflow = createWorkflow(
  "create-review",
  (reviewInput: CreateReviewWorkflowInput) => {
    const review = createReviewStep(reviewInput)

    return new WorkflowResponse(review)
  }
) 