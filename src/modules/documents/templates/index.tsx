"use client"

import { useState, useEffect } from "react"

interface DocumentSection {
  title: string
  content: string
}

interface Document {
  title: string
  sections: Record<string, DocumentSection>
}

const documentsData: Record<string, Document> = {
  "privacy-policy": {
    title: "Политика конфиденциальности",
    sections: {
      "general": {
        title: "1. Общие положения",
        content: `1. Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта.

2. Политика разработана в соответствии с действующим законодательством Российской Федерации.

3. Использование сайта означает безоговорочное согласие пользователя с настоящей Политикой.

4. В случае несогласия с условиями Политики пользователь должен прекратить использование сайта.`
      },
      "data-collection": {
        title: "2. Сбор данных",
        content: `1. Мы собираем только необходимые данные для обеспечения качественного сервиса и выполнения заказов.

2. Персональные данные собираются при регистрации, оформлении заказа или подписке на рассылку.

3. К собираемым данным относятся: ФИО, адрес электронной почты, номер телефона, адрес доставки.

4. Сбор данных осуществляется только с согласия пользователя.

5. Пользователь имеет право отозвать согласие на обработку персональных данных.`
      },
      "data-usage": {
        title: "3. Использование данных",
        content: `1. Персональные данные используются исключительно для обработки заказов и улучшения качества обслуживания.

2. Данные могут использоваться для информирования о новых товарах и акциях.

3. Мы не передаем персональные данные третьим лицам без согласия пользователя.

4. Исключение составляют случаи, предусмотренные действующим законодательством.`
      },
      "rights-obligations": {
        title: "4. Права и обязанности продавца",
        content: `1. Продавец обязуется защищать регистрационную информацию Клиента.

2. Продавец обязуется не разглашать регистрационную информацию Клиента третьим лицам, кроме случаев, предусмотренных действующим законодательством и настоящими Правилами.

3. Продавец не несёт ответственности за самостоятельное раскрытие Клиентом своей регистрационной информации другим Клиентам.

4. В случае нарушения Клиентом условий настоящих Правил, либо действующего законодательства РФ, Продавец оставляет за собой право передачи регистрационной информации, IP адреса, любой другой информации заинтересованным лицам.

5. Продавец вправе использовать информацию о действиях Клиента в целях улучшения работы Интернет-магазина.

6. Продавец оставляет за собой право закрыть, приостановить, изменить работу Интернет-магазина или его части путем внесения соответствующих изменений в настоящие правила без предварительного уведомления Клиента.`
      },
      "data-protection": {
        title: "5. Защита данных",
        content: `1. Мы применяем современные технические и организационные меры для защиты персональных данных.

2. Доступ к персональным данным имеют только уполномоченные сотрудники.

3. Все сотрудники обязаны соблюдать конфиденциальность персональных данных.

4. Персональные данные хранятся на защищенных серверах с ограниченным доступом.`
      },
      "user-rights": {
        title: "6. Права пользователей",
        content: `1. Вы имеете право на доступ к своим персональным данным.

2. Вы можете требовать исправления неточных или неполных данных.

3. Вы имеете право на удаление своих персональных данных.

4. Вы можете ограничить обработку своих персональных данных.

5. Вы имеете право на портируемость данных.`
      }
    }
  },
  "personal-data": {
    title: "Обработка персональных данных",
    sections: {
      "consent": {
        title: "Согласие на обработку",
        content: "Предоставляя свои персональные данные, вы даете согласие на их обработку в соответствии с законодательством."
      },
      "storage": {
        title: "Хранение данных",
        content: "Персональные данные хранятся в защищенном виде и не передаются третьим лицам без согласия."
      },
      "rights": {
        title: "Права пользователей",
        content: "Вы имеете право на доступ, изменение и удаление своих персональных данных."
      }
    }
  },
  "site-documents": {
    title: "Документы сайта",
    sections: {
      "terms": {
        title: "Пользовательское соглашение",
        content: "Условия использования сайта и правила взаимодействия с пользователями."
      },
      "rules": {
        title: "Правила сайта",
        content: "Основные правила поведения на сайте и ответственность пользователей."
      },
      "disclaimer": {
        title: "Отказ от ответственности",
        content: "Ограничения ответственности администрации сайта в различных ситуациях."
      }
    }
  },
  "returns": {
    title: "Возврат товара",
    sections: {
      "conditions": {
        title: "Условия возврата",
        content: "Товар можно вернуть в течение 14 дней с момента получения при соблюдении условий."
      },
      "process": {
        title: "Процедура возврата",
        content: "Для возврата товара необходимо связаться с службой поддержки и оформить заявку."
      },
      "refund": {
        title: "Возврат денежных средств",
        content: "Денежные средства возвращаются в течение 10 рабочих дней после получения товара."
      }
    }
  },
  "delivery-payment": {
    title: "Доставка и оплата",
    sections: {
      "delivery": {
        title: "Способы доставки",
        content: "Доставка осуществляется курьерской службой, почтой России или самовывозом."
      },
      "payment": {
        title: "Способы оплаты",
        content: "Оплата возможна банковской картой, электронными деньгами или наличными при получении."
      },
      "timing": {
        title: "Сроки доставки",
        content: "Доставка по Москве осуществляется в течение 1-2 дней, по России - 3-7 дней."
      }
    }
  },
  "loyalty": {
    title: "Программа лояльности",
    sections: {
      "benefits": {
        title: "Преимущества программы",
        content: "Участники программы лояльности получают скидки, бонусы и специальные предложения."
      },
      "levels": {
        title: "Уровни программы",
        content: "Программа включает несколько уровней с различными привилегиями и условиями."
      },
      "points": {
        title: "Накопление баллов",
        content: "Баллы начисляются за покупки и могут быть использованы для получения скидок."
      }
    }
  },
  "contacts": {
    title: "Контакты",
    sections: {
      "support": {
        title: "Служба поддержки",
        content: "Телефон: +7 (495) 123-45-67, Email: support@ugodo.ru, Время работы: пн-пт 9:00-18:00"
      },
      "office": {
        title: "Офис компании",
        content: "Адрес: г. Москва, ул. Примерная, д. 123, офис 456"
      },
      "social": {
        title: "Социальные сети",
        content: "Следите за нами в социальных сетях для получения актуальной информации и специальных предложений."
      }
    }
  },
  "marketing": {
    title: "Маркетинг и реклама",
    sections: {
      "advertising": {
        title: "Рекламные материалы",
        content: "Информация о размещении рекламы и использовании рекламных материалов."
      },
      "partnerships": {
        title: "Партнерские программы",
        content: "Условия участия в партнерских программах и сотрудничества."
      },
      "promotions": {
        title: "Акции и скидки",
        content: "Правила проведения акций, распродаж и предоставления скидок."
      }
    }
  },
  "assortment": {
    title: "Предложения по ассортименту",
    sections: {
      "suggestions": {
        title: "Как предложить товар",
        content: "Процедура подачи предложений по расширению ассортимента магазина."
      },
      "requirements": {
        title: "Требования к товарам",
        content: "Основные требования к качеству и характеристикам товаров для включения в ассортимент."
      },
      "cooperation": {
        title: "Условия сотрудничества",
        content: "Условия работы с поставщиками и производителями товаров."
      }
    }
  }
}

export default function DocumentsTemplate() {
  const [openAccordions, setOpenAccordions] = useState<string[]>(["site-documents"])
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && documentsData[hash]) {
      setOpenAccordions([hash])
      
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id]')
      let currentSection = ''
      const headerHeight = 80 // Высота шапки
      const offset = headerHeight + 50 // Дополнительный отступ
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= offset && rect.bottom >= offset) {
          currentSection = section.id
        }
      })
      
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection)
        
        // Открываем соответствующий аккордеон
        Object.entries(documentsData).forEach(([docKey, doc]) => {
          if (Object.keys(doc.sections).includes(currentSection)) {
            if (!openAccordions.includes(docKey)) {
              setOpenAccordions([docKey])
            }
          }
        })
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Вызываем сразу для установки начального состояния
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection, openAccordions])

  const toggleAccordion = (documentKey: string) => {
    setOpenAccordions(prev => 
      prev.includes(documentKey) 
        ? prev.filter(key => key !== documentKey)
        : [documentKey]
    )
  }

  const handleSectionClick = (documentKey: string, sectionKey: string) => {
    window.history.pushState(null, '', `#${sectionKey}`)
    
    if (!openAccordions.includes(documentKey)) {
      setOpenAccordions([documentKey])
    }
    
    setTimeout(() => {
      const element = document.getElementById(sectionKey)
      if (element) {
        const headerHeight = 80
        const offset = headerHeight + 20
        const elementPosition = element.offsetTop - offset
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="documents-container grid max-w-[1530px] mx-auto min-h-screen" style={{
        gridTemplateAreas: '". sidebar . main ."',
        gridTemplateColumns: '12% 30% 8% 42% 8%'
      }}>
        <div 
          className="documents-sidebar fixed top-1/2 transform -translate-y-1/2 h-fit" 
          style={{ 
            gridArea: 'sidebar',
            width: '30%',
            maxWidth: '459px'
          }}
        >
          {Object.entries(documentsData).map(([documentKey, document]) => (
            <div key={documentKey} className="accordion-item">
              <button
                onClick={() => toggleAccordion(documentKey)}
                className="accordion-header w-full text-left hover:text-gray-500 transition-colors flex items-center justify-between text-xl font-medium py-3 cursor-pointer"
              >
                <span>{document.title}</span>
                <span className="text-base font-normal">
                  {openAccordions.includes(documentKey) ? '−' : '+'}
                </span>
              </button>
              
              {openAccordions.includes(documentKey) && (
                <div className="accordion-content">
                  {Object.entries(document.sections).map(([sectionKey, section]) => (
                    <button
                      key={sectionKey}
                      onClick={() => handleSectionClick(documentKey, sectionKey)}
                      className={`section-link block w-full text-left transition-colors text-base py-2 pl-4 cursor-pointer ${
                        activeSection === sectionKey 
                          ? 'text-black font-medium' 
                          : 'text-gray-700 hover:text-black'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div 
          className="documents-main" 
          style={{ 
            gridArea: 'main'
          }}
        >
          <h1 
            className="document-title text-6xl font-medium mb-10 pt-20 pb-20 pr-30"
            style={{
              letterSpacing: '-0.2px',
              lineHeight: 1
            }}
          >
            Документы сайта
          </h1>
          
          {Object.entries(documentsData).map(([documentKey, document]) => (
            <div key={documentKey} id={documentKey} className="mb-16">
              <h2 
                className="section-title text-4xl font-medium mb-8"
                style={{
                  letterSpacing: '-0.2px',
                  lineHeight: 1
                }}
              >
                {document.title}
              </h2>
              
              {Object.entries(document.sections).map(([sectionKey, section]) => (
                <div key={sectionKey} id={sectionKey} className="mb-8">
                  <h3 
                    className="subsection-title text-xl font-medium mb-4"
                  >
                    {section.title}
                  </h3>
                  
                  <div 
                    className="section-content text-base text-gray-700 whitespace-pre-line"
                    style={{
                      lineHeight: 1.625
                    }}
                  >
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 