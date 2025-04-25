import { useState, useMemo } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { 
  Container, 
  Heading, 
  Button, 
  Text,
  Toaster,
  toast,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable, 
  Badge,
  DropdownMenu,
  usePrompt,
} from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { TagSolid } from "@medusajs/icons"
import { sdk } from "../../lib/sdk"
import NewBanner from "./new"
import EditBanner from "./edit"

type Banner = {
  id: string
  title: string
  position: string
  active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

type BannersResponse = {
  banners: Banner[]
  count: number
  limit: number
  offset: number
}

// Создаем помощник для колонок DataTable
const columnHelper = createDataTableColumnHelper<Banner>()

const BannersPage = () => {
  const prompt = usePrompt()
  const [isCreating, setIsCreating] = useState(false)
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
  
  // Настройка пагинации
  const limit = 10
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  
  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])
  
  // Загрузка данных о баннерах
  const { data, isLoading, refetch } = useQuery<BannersResponse>({
    queryFn: () => sdk.client.fetch(`/admin/banners`, {
      query: {
        limit,
        offset,
      },
    }),
    queryKey: [["banners", limit, offset]],
  })
  
  // Мутация для удаления баннера
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/banners/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Баннер успешно удален",
        variant: "success",
      })
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: `Произошла ошибка при удалении баннера: ${error.message}`,
        variant: "error",
      })
    },
  })
  
  // Обработчик удаления баннера
  const handleDelete = async (id: string) => {
    const result = await prompt({
      title: "Удалить баннер?",
      description: "Это действие нельзя отменить. Баннер будет навсегда удален из системы.",
      confirmText: "Удалить",
      cancelText: "Отмена",
    })
    
    if (result) {
      deleteBannerMutation.mutate(id)
    }
  }
  
  // Определяем колонки таблицы
  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <Text size="small">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("title", {
      header: "Название",
      cell: (info) => <Text>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("position", {
      header: "Позиция",
      cell: (info) => {
        const position = info.getValue()
        let label = "Позиция не указана"
        
        switch (position) {
          case "HOME_TOP":
            label = "Верх главной страницы"
            break
          case "HOME_MIDDLE":
            label = "Середина главной страницы"
            break
          case "PRODUCT_RELATED":
            label = "Связанные товары"
            break
          case "CATEGORY_TOP":
            label = "Верх категории"
            break
        }
        
        return <Text>{label}</Text>
      },
    }),
    columnHelper.accessor("active", {
      header: "Статус",
      cell: (info) => {
        const active = info.getValue()
        return <Badge color={active ? "green" : "red"}>{active ? "Активен" : "Неактивен"}</Badge>
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Создан",
      cell: (info) => {
        const date = new Date(info.getValue())
        return <Text size="small">{date.toLocaleDateString()}</Text>
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Действия",
      cell: (info) => {
        const banner = info.row.original
        
        return (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary" size="small">Действия</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => setEditingBannerId(banner.id)}>
                Редактировать
              </DropdownMenu.Item>
              <DropdownMenu.Item className="text-ui-fg-error" onClick={() => handleDelete(banner.id)}>
                Удалить
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )
      },
    }),
  ], [])
  
  // Настройка DataTable
  const tableConfig = useDataTable({
    columns,
    data: data?.banners || [],
    manualPagination: true,
    pageCount: data ? Math.ceil((data.count || 0) / limit) : 0,
    autoResetPageIndex: false,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  })
  
  return (
    <Container className="p-0">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <Heading level="h1">Баннеры</Heading>
          <Text className="text-ui-fg-subtle">
            Управление баннерами на сайте
          </Text>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            Создать баннер
          </Button>
        </div>
      </div>
      
      {isCreating && (
        <NewBanner 
          onClose={() => setIsCreating(false)} 
          onSuccess={() => {
            setIsCreating(false)
            refetch()
            toast({
              title: "Успех",
              description: "Баннер успешно создан",
              variant: "success",
            })
          }}
        />
      )}
      
      {editingBannerId && (
        <EditBanner 
          bannerId={editingBannerId}
          onClose={() => setEditingBannerId(null)} 
          onSuccess={() => {
            setEditingBannerId(null)
            refetch()
            toast({
              title: "Успех",
              description: "Баннер успешно обновлен",
              variant: "success",
            })
          }}
        />
      )}
      
      <div>
        <DataTable 
          {...tableConfig}
          className="border-collapse"
          enablePagination
        />
      </div>
      
      <Toaster />
    </Container>
  )
}

export default BannersPage

export const config = defineRouteConfig({
  link: {
    label: "Баннеры",
    icon: TagSolid,
  }
}) 