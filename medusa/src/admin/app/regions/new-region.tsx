'use client';

import { Region } from "@medusajs/medusa";
import { Button, Container, Heading, Text } from "@medusajs/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function NewRegion() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("Россия");
  const [currencyCode, setCurrencyCode] = useState("RUB");
  const [taxRate, setTaxRate] = useState(20);
  const [countries, setCountries] = useState(["ru"]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/regions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          currency_code: currencyCode,
          tax_rate: taxRate,
          countries,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось создать регион");
      }

      toast.success("Регион успешно создан!");
      router.push("/regions");
    } catch (error) {
      console.error("Ошибка при создании региона:", error);
      toast.error(`Ошибка: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div>
          <Heading level="h1" className="mb-2">Создать новый регион</Heading>
          <Text>Заполните форму для создания нового региона</Text>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">Название региона</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 border rounded"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="currencyCode" className="text-sm font-medium">Код валюты</label>
            <input
              id="currencyCode"
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="p-2 border rounded"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="taxRate" className="text-sm font-medium">Ставка налога (%)</label>
            <input
              id="taxRate"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="p-2 border rounded"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="countries" className="text-sm font-medium">Коды стран (через запятую)</label>
            <input
              id="countries"
              type="text"
              value={countries.join(",")}
              onChange={(e) => setCountries(e.target.value.split(",").map(c => c.trim()))}
              className="p-2 border rounded"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="mt-4"
          >
            {isSubmitting ? "Создание..." : "Создать регион"}
          </Button>
        </form>
      </div>
    </Container>
  );
} 