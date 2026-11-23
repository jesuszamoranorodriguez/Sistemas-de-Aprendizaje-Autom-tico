import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Presupuesta — presupuestos para autónomos de reformas",
  description:
    "Haz una foto de la avería, revisa el presupuesto que propone la IA y envíalo al cliente por WhatsApp. Pensado para fontaneros, electricistas y albañiles.",
};

export const viewport: Viewport = {
  themeColor: "#f2f4f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={archivo.variable}>
      <body className="bg-papel font-sans text-tinta antialiased">
        {children}
      </body>
    </html>
  );
}
