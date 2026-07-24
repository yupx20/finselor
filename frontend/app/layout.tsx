import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Finselor — Smart Personal Finance Manager",
  description:
    "Track your cash flow, set savings goals, and receive AI-powered investment recommendations. Your intelligent financial assistant.",
  keywords: ["personal finance", "budgeting", "savings", "AI advisor", "investment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
