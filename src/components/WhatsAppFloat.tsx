"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349039194587";
  const message = encodeURIComponent("Hi D_ALLURE, I'd like to know more about your perfumes.");

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-burgundy hover:bg-burgundy-bright transition-colors shadow-lg shadow-black/40"
    >
      <MessageCircle size={26} className="text-white" />
    </a>
  );
}
