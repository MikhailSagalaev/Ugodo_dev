export const POST: MedusaCustomRequestHandler = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Оптимизация: заменить цикл на bulkUpdate
  const results = await reviewService.bulkUpdate(review_ids, { approved })
  
  res.status(200).json({
    reviews: results,
    count: results.length,
    action
  })
} 