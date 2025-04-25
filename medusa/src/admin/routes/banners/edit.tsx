import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { 
  FocusModal, 
  Button, 
  Heading, 
  Label, 
  Input, 
  Select,
  Switch,
  usePrompt,
} from "@medusajs/ui"
import { sdk } from "../../lib/sdk"

interface EditBannerProps {
  bannerId: string
  onClose: () => void
  onSuccess: () => void
}

interface Banner {
  id: string
  title: string
  subtitle?: string
  position: string
  active: boolean
  image_url?: string
}

const EditBanner = ({ bannerId, onClose, onSuccess }: EditBannerProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)
  const [isLoadingBanner, setIsLoadingBanner] = useState(true)
  const prompt = usePrompt()
  
  // Загрузка данных баннера
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setIsLoadingBanner(true)
        const { banner } = await sdk.client.fetch(`/admin/banners/${bannerId}`)
        setBanner(banner)
      } catch (error: any) {
        prompt({
          title: "Ошибка",
          description: `Не удалось загрузить данные баннера: ${error.message}`,
          confirmText: "OK",
        })
        onClose()
      } finally {
        setIsLoadingBanner(false)
      }
    }
    
    fetchBanner()
  }, [bannerId])
  
  const updateBannerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const updatedBanner = {
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        position: formData.get("position") as string,
        active: formData.get("active") === "on",
        image_url: formData.get("image_url") as string,
      }
      
      return sdk.client.fetch(`/admin/banners/${bannerId}`, {
        method: "PUT",
        body: updatedBanner,
      })
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error: any) => {
      prompt({
        title: "Ошибка",
        description: `Произошла ошибка при обновлении баннера: ${error.message}`,
        confirmText: "OK",
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    updateBannerMutation.mutate(formData)
  }
  
  if (isLoadingBanner) {
    return (
      <FocusModal open onOpenChange={onClose}>
        <FocusModal.Content>
          <FocusModal.Header>
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
          </FocusModal.Header>
          <FocusModal.Body className="flex flex-col items-center justify-center py-16">
            <div className="text-ui-fg-subtle text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-t-2 border-ui-border rounded-full animate-spin"></div>
              <p>Загрузка данных баннера...</p>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    )
  }
  
  if (!banner) {
    return null
  }
  
  return (
    <FocusModal open onOpenChange={onClose}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <div className="gap-x-2 flex items-center">
            <Button 
              variant="primary"
              form="banner-edit-form"
              type="submit"
              isLoading={isLoading}
            >
              Сохранить
            </Button>
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="w-full max-w-lg">
            <Heading className="mb-6">
              Редактировать баннер
            </Heading>
            <form id="banner-edit-form" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-y-4">
                <div>
                  <Label htmlFor="title">Заголовок*</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Введите заголовок" 
                    defaultValue={banner.title}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subtitle">Подзаголовок</Label>
                  <Input 
                    id="subtitle" 
                    name="subtitle" 
                    placeholder="Введите подзаголовок" 
                    defaultValue={banner.subtitle || ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Позиция*</Label>
                  <Select name="position" defaultValue={banner.position} required>
                    <option value="HOME_TOP">Верх главной страницы</option>
                    <option value="HOME_MIDDLE">Середина главной страницы</option>
                    <option value="PRODUCT_RELATED">Связанные товары</option>
                    <option value="CATEGORY_TOP">Верх категории</option>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="image_url">URL изображения</Label>
                  <Input 
                    id="image_url" 
                    name="image_url" 
                    placeholder="https://example.com/image.jpg" 
                    defaultValue={banner.image_url || ""}
                  />
                </div>
                
                <div className="flex items-center gap-x-2">
                  <Switch 
                    id="active" 
                    name="active" 
                    defaultChecked={banner.active} 
                  />
                  <Label htmlFor="active">Активен</Label>
                </div>
              </div>
            </form>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

export default EditBanner 