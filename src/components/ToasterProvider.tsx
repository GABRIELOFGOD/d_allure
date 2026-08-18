"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#1e1512",
          color: "#efe6d8",
          border: "1px solid #33241f",
          borderRadius: 0,
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          letterSpacing: "0.02em",
        },
        success: { iconTheme: { primary: "#9c1836", secondary: "#efe6d8" } },
        error: { iconTheme: { primary: "#9c1836", secondary: "#efe6d8" } },
      }}
    />
  );
}
