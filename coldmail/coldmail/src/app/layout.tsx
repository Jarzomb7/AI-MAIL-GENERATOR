import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ColdMail Generator",
  description: "Generuj spersonalizowane cold maile dla firm z pomocą AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
