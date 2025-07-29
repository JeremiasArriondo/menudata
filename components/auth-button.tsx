"use client";

import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  Edit,
  LogOut,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { user, loading, signOut, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 bg-brand-bg-200 rounded-full animate-pulse"></div>
    );
  }

  // Show demo mode message when Supabase is not configured
  if (!isConfigured) {
    return (
      <div className="flex items-center space-x-2">
        <div className="hidden md:block">
          <Alert className="border-brand-accent-100 bg-brand-accent-100/10 py-2 px-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs text-brand-text-100">
              Modo Demo - Auth deshabilitado
            </AlertDescription>
          </Alert>
        </div>
        <Link href="/crear-menu">
          <Button className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white">
            Crear Menú
          </Button>
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button
            variant="ghost"
            className="text-brand-text-100 hover:text-brand-primary-100"
          >
            Iniciar Sesión
          </Button>
        </Link>
        <Link href="/register">
          <Button className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white">
            Registrarse
          </Button>
        </Link>
      </div>
    );
  }

  const userInitials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.split("@")[0].slice(0, 2).toUpperCase() ||
    "U";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.user_metadata?.avatar_url || ""}
              alt={user.user_metadata?.full_name || ""}
            />
            <AvatarFallback className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-brand-text-200">
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "Usuario"}
            </p>
            <p className="text-xs leading-none text-brand-text-100">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Mi Panel</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/crear-menu" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Crear Menú</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/editar-menu" className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar Menú</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-brand-primary-200 focus:text-brand-primary-200"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
