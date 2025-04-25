import { useState } from "react"
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

interface NewBannerProps {
  onClose: () => void
  onSuccess: () => void
}

const NewBanner = ({ onClose, onSuccess }: NewBannerProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const prompt = usePrompt()
  
  const createBannerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const banner = {
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        position: formData.get("position") as string,
        active: formData.get("active") === "on",
        image_url: formData.get("image_url") as string,
      }
      
      return sdk.client.fetch(`/admin/banners`, {
        method: "POST",
        body: banner,
      })
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (error: any) => {
      prompt({
        title: "Ошибка",
        description: `Произошла ошибка при создании баннера: ${error.message}`,
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
    
    createBannerMutation.mutate(formData)
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
              form="banner-form"
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
              Создать баннер
            </Heading>
            <form id="banner-form" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-y-4">
                <div>
                  <Label htmlFor="title">Заголовок*</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Введите заголовок" 
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subtitle">Подзаголовок</Label>
                  <Input 
                    id="subtitle" 
                    name="subtitle" 
                    placeholder="Введите подзаголовок" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Позиция*</Label>
                  <Select name="position" defaultValue="HOME_TOP" required>
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
                  />
                </div>
                
                <div className="flex items-center gap-x-2">
                  <Switch 
                    id="active" 
                    name="active" 
                    defaultChecked={true} 
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

export default NewBanner 