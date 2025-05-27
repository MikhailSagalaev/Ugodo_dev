"use client";
import * as React from "react";

function Footer() {
  return (
    <div className="flex flex-col pt-16 mt-20 w-full bg-black max-md:mt-10 max-md:max-w-full">
      <div className="flex flex-wrap gap-10 justify-between items-start self-center px-5 w-full max-w-[1120px] max-md:max-w-full">
        <div className="w-[200px] mb-10 md:mb-0">
          <div className="w-full">
            <div className="text-xs leading-snug text-zinc-400">
              Телефон call-центра
            </div>
            <div className="mt-1 text-2xl text-white">
              +8 800 101 78 72
            </div>
          </div>
          <div className="flex gap-5 items-start mt-6 w-full">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/442b1610d7b2616f16e9cce39e18af65d66261e3?placeholderIfAbsent=true&apiKey=61ffe663603f4de3aa93a6286a9db479"
              className="object-contain shrink-0 w-6 aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              alt="Social media icon 1"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f2741f0de1e1f7f80d7c15805976b413c610c267?placeholderIfAbsent=true&apiKey=61ffe663603f4de3aa93a6286a9db479"
              className="object-contain shrink-0 w-6 aspect-square cursor-pointer hover:opacity-80 transition-opacity"
              alt="Social media icon 2"
            />
          </div>
        </div>
        <div className="w-[200px] mb-10 md:mb-0">
          <div className="w-full text-2xl text-white mb-6">
            О нас
          </div>
          <div className="text-base text-zinc-400 space-y-4">
            <div className="hover:text-white transition-colors cursor-pointer">
              политика обработки персональных данных
            </div>
            <div className="hover:text-white transition-colors cursor-pointer">
              документы сайта
            </div>
            <div className="hover:text-white transition-colors cursor-pointer">
              настройки cookies
            </div>
          </div>
        </div>
        <div className="w-[200px] mb-10 md:mb-0">
          <div className="w-full text-2xl text-white whitespace-nowrap mb-6">
            Клиентам
          </div>
          <div className="text-base text-zinc-400 space-y-4">
            <div className="hover:text-white transition-colors cursor-pointer">
              доставка и оплата
            </div>
            <div className="hover:text-white transition-colors cursor-pointer">
              возврат товара
            </div>
            <div className="hover:text-white transition-colors cursor-pointer">
              программа лояльности
            </div>
          </div>
        </div>
        <div className="w-[200px] mb-10 md:mb-0">
          <div className="w-full text-2xl text-white whitespace-nowrap mb-6">
            Контакты
          </div>
          <div className="text-base text-zinc-400 space-y-4">
            <div className="hover:text-white transition-colors cursor-pointer">
              общие контакты
            </div>
            <div className="hover:text-white transition-colors cursor-pointer">
              отдел маркетинга и рекламы
            </div>
            <div className="hover:text-white transition-colors cursor-pointer">
              для предложений по ассортименту
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-zinc-700 mt-16 mb-8 max-md:mt-10 max-md:mb-6"></div>
      <div className="text-center text-zinc-500 text-sm pb-8">
        © {new Date().getFullYear()} Ugodo. Все права защищены.
      </div>
    </div>
  );
}

export default Footer;
