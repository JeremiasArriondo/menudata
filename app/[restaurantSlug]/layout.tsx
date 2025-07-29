import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

interface Props {
  params: { restaurantSlug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // En producción, aquí cargarías los datos del restaurante desde la API
  const restaurantName = params.restaurantSlug.replace(/-/g, " ");

  return {
    title: `${restaurantName} - Menú Digital | MenuData`,
    description: `Descubre el menú completo de ${restaurantName}. Platos, precios y toda la información actualizada.`,
    openGraph: {
      title: `${restaurantName} - Menú Digital`,
      description: `Descubre el menú completo de ${restaurantName}. Platos, precios y toda la información actualizada.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${restaurantName} - Menú Digital`,
      description: `Descubre el menú completo de ${restaurantName}. Platos, precios y toda la información actualizada.`,
    },
  };
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
