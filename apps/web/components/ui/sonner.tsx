"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
}

export { Toaster };
