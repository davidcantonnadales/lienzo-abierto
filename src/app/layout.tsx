import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Lienzo Abierto · Un lugar para mirar despacio",
  description:
    "Una galería abierta de ilustraciones. Explora, guarda tus favoritas y añade imágenes que se quedan en tu navegador.",
  icons: { icon: "/logo.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
