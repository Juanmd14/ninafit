import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NiNa'S HIIT",
  description: "Tu gimnasio, en una sola app.",
  applicationName: "NiNa'S HIIT",
};

export const viewport: Viewport = {
  themeColor: "#120C10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${montserrat.variable} ${playfair.variable} ${spaceMono.variable}`}
    >
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
