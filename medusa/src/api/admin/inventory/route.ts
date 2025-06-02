import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getVariantAvailability } from "@medusajs/framework/utils";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");
  const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL);
  
  const { sku, variant_id } = req.query;

  if (!sku && !variant_id) {
    return res.status(400).json({
      error: "Укажите sku или variant_id в параметрах запроса"
    });
  }

  try {
    const salesChannels = await salesChannelModuleService.listSalesChannels();
    if (!salesChannels.length) {
      return res.status(500).json({
        error: "Не найдено каналов продаж"
      });
    }

    const defaultSalesChannel = salesChannels[0];

    let variantIds: string[] = [];

    if (variant_id) {
      variantIds = [variant_id as string];
    } else if (sku) {
      const { data: variants } = await query.graph({
        entity: "variant",
        fields: ["id", "sku", "title", "product.title"],
        filters: {
          sku: sku as any
        }
      });

      if (!variants.length) {
        return res.status(404).json({
          error: `Вариант с SKU "${sku}" не найден`
        });
      }

      variantIds = variants.map((v: any) => v.id);
    }

    const availability = await getVariantAvailability(query, {
      variant_ids: variantIds,
      sales_channel_id: defaultSalesChannel.id,
    });

    const result = Object.entries(availability).map(([variantId, data]: [string, any]) => ({
      variant_id: variantId,
      quantity: data.availability,
      sales_channel_id: data.sales_channel_id,
      status: data.availability > 0 ? "В наличии" : "Нет в наличии"
    }));

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Ошибка при получении количества:", error);
    return res.status(500).json({
      error: "Ошибка при получении количества товара",
      details: error.message
    });
  }
} 