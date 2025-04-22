import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { 
  Container, 
  Heading, 
  Table,
  Button,
  StatusBadge
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type AdminReview = {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  status: "pending" | "approved" | "rejected"
  product_id: string
  customer_id?: string
  created_at: string
  updated_at: string
}

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const { reviews } = await sdk.client.fetch("/admin/reviews")
      setReviews(reviews)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const approveReview = async (id: string) => {
    try {
      await sdk.client.fetch(`/admin/reviews/${id}/approve`, {
        method: "POST",
      })
      fetchReviews()
    } catch (error) {
      console.error(error)
    }
  }

  const rejectReview = async (id: string) => {
    try {
      await sdk.client.fetch(`/admin/reviews/${id}/reject`, {
        method: "POST",
      })
      fetchReviews()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <Heading>Отзывы о товарах</Heading>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-10">Загрузка...</div>
      ) : reviews.length === 0 ? (
        <div className="flex justify-center p-10">Отзывы не найдены</div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Заголовок</Table.HeaderCell>
              <Table.HeaderCell>Рейтинг</Table.HeaderCell>
              <Table.HeaderCell>Статус</Table.HeaderCell>
              <Table.HeaderCell>Действия</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviews.map((review) => (
              <Table.Row key={review.id}>
                <Table.Cell>{review.title || review.content.substring(0, 30) + "..."}</Table.Cell>
                <Table.Cell>{review.rating}/5</Table.Cell>
                <Table.Cell>
                  <StatusBadge 
                    color={
                      review.status === "approved" 
                        ? "green" 
                        : review.status === "rejected" 
                        ? "red" 
                        : "grey"
                    }
                  >
                    {review.status === "approved" 
                      ? "Одобрен" 
                      : review.status === "rejected" 
                      ? "Отклонен" 
                      : "Ожидает"
                    }
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={() => approveReview(review.id)}
                      disabled={review.status === "approved"}
                    >
                      Одобрить
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => rejectReview(review.id)}
                      disabled={review.status === "rejected"}
                    >
                      Отклонить
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Отзывы",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage 