/**
 * @file: index.tsx
 * @description: Компонент для формы подписки на email-рассылку.
 * @dependencies: React, @medusajs/ui (Heading, Text, Input, Button, Container)
 * @created: 2024-07-30
 */

'use client'; // Так как будет использоваться useState для email

import React, { useState } from "react";
import { Heading, Text, Input, Button, Container, clx } from "@medusajs/ui";

const NewsletterSubscription: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubscribed(false);

    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError("Пожалуйста, введите корректный email.");
      return;
    }

    // Здесь будет логика отправки email на бэкенд
    // Например, await medusaClient.newsletter.subscribe(email)
    // Пока что просто имитируем успех
    console.log("Email для подписки:", email);
    setTimeout(() => {
      setSubscribed(true);
      setEmail("");
    }, 1000);
  };

  return (
    <div className="bg-primary text-white">
      <Container className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Heading level="h2" className="text-2xl md:text-3xl font-semibold mb-3">
            Будьте в курсе новинок и акций!
          </Heading>
          <Text className="mb-8 text-white/90">
            Подпишитесь на нашу рассылку и получайте эксклюзивные предложения первыми.
          </Text>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
              <Input 
                type="email"
                name="email"
                aria-label="Email для подписки"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-white/10 border-white/20 placeholder-white/50 focus:bg-white/20 focus:ring-ugodo-light-beige text-white"
                autoComplete="email"
                required
              />
              <Button 
                type="submit"
                variant="secondary" // Используем secondary, чтобы он выделялся на фоне primary
                className="w-full sm:w-auto bg-ugodo hover:bg-ugodo-dark text-black border-none rounded-none"
                size="large"
              >
                Подписаться
              </Button>
            </form>
          ) : (
            <Text className="text-lg text-ugodo-light-beige">
              Спасибо за подписку! Проверьте вашу почту для подтверждения.
            </Text>
          )}
          {error && <Text className="mt-3 text-red-400">{error}</Text>}
        </div>
      </Container>
    </div>
  );
};

export default NewsletterSubscription; 