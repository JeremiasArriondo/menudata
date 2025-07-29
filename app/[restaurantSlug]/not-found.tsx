"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8">
          <div className="text-8xl mb-6">🍽️</div>
          <h1 className="text-3xl font-bold text-brand-text-200 mb-2">
            Restaurante no encontrado
          </h1>
          <p className="text-brand-text-100 mb-6">
            Lo sentimos, no pudimos encontrar el menú que buscas. Verifica la
            URL o contacta directamente al restaurante.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Link href="/">
              <Button className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 text-white w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-brand-bg-200 rounded-lg">
            <h3 className="font-semibold text-brand-text-200 mb-2">
              ¿Eres dueño de un restaurante?
            </h3>
            <p className="text-sm text-brand-text-100 mb-3">
              Crea tu menú digital en minutos
            </p>
            <Link href="/crear-menu">
              <Button
                size="sm"
                className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 text-white"
              >
                Crear mi menú gratis
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
