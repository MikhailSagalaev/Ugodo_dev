import { RouteConfig } from "@medusajs/admin"
import { Button, Container, Heading, Table } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { AdminReview } from "../../types"
import { sdk } from "../../lib/sdk"

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { reviews } = await sdk.client.fetch("/admin/reviews")
        setReviews(reviews)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

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
                <Table.Cell>{review.title}</Table.Cell>
                <Table.Cell>{review.rating}/5</Table.Cell>
                <Table.Cell>{review.status}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="small">
                      Просмотр
                    </Button>
                    <Button variant="secondary" size="small">
                      Одобрить
                    </Button>
                    <Button variant="danger" size="small">
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

export const config: RouteConfig = {
  link: {
    label: "Отзывы",
    icon: "star",
  },
}

export default ReviewsPage 