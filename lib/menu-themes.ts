export interface MenuTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  classes: {
    bg: string;
    card: string;
    text: string;
    textSecondary: string;
    accent: string;
    button: string;
    header: string;
    categoryTitle: string;
    price: string;
    border: string;
  };
  style: {
    borderRadius: string;
    fontFamily: string;
    cardStyle: string;
    headerStyle: string;
  };
}

export const menuThemes: MenuTheme[] = [
  {
    id: "clasico",
    name: "Clásico",
    description: "Diseño tradicional y elegante",
    preview: "🏛️",
    classes: {
      bg: "bg-gradient-to-br from-pink-50 to-rose-100",
      card: "bg-white border-pink-200 shadow-md",
      text: "text-gray-800",
      textSecondary: "text-gray-600",
      accent: "text-pink-600",
      button: "bg-pink-600 hover:bg-pink-700 text-white",
      header: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
      categoryTitle: "text-pink-700 border-b-2 border-pink-200",
      price: "text-pink-600 font-semibold",
      border: "border-pink-200",
    },
    style: {
      borderRadius: "rounded-xl",
      fontFamily: "font-serif",
      cardStyle: "shadow-md border",
      headerStyle: "text-center",
    },
  },
  {
    id: "moderno",
    name: "Moderno",
    description: "Minimalista y contemporáneo",
    preview: "✨",
    classes: {
      bg: "bg-gradient-to-br from-slate-50 to-indigo-100",
      card: "bg-white border-indigo-200 shadow-lg",
      text: "text-slate-800",
      textSecondary: "text-slate-600",
      accent: "text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
      header: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
      categoryTitle: "text-indigo-700 border-b-2 border-indigo-200",
      price: "text-indigo-600 font-semibold",
      border: "border-indigo-200",
    },
    style: {
      borderRadius: "rounded-2xl",
      fontFamily: "font-sans",
      cardStyle: "shadow-lg border-0",
      headerStyle: "text-left",
    },
  },
  {
    id: "elegante",
    name: "Elegante",
    description: "Sofisticado y premium",
    preview: "💎",
    classes: {
      bg: "bg-gradient-to-br from-gray-50 to-stone-100",
      card: "bg-white border-gray-200 shadow-sm",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      accent: "text-amber-600",
      button: "bg-gray-800 hover:bg-gray-900 text-white",
      header: "bg-gradient-to-r from-gray-800 to-gray-900 text-white",
      categoryTitle: "text-gray-800 border-b-2 border-amber-200",
      price: "text-amber-600 font-semibold",
      border: "border-gray-200",
    },
    style: {
      borderRadius: "rounded-lg",
      fontFamily: "font-serif",
      cardStyle: "shadow-sm border",
      headerStyle: "text-center",
    },
  },
  {
    id: "colorido",
    name: "Colorido",
    description: "Vibrante y divertido",
    preview: "🌈",
    classes: {
      bg: "bg-gradient-to-br from-pink-50 to-purple-100",
      card: "bg-white border-pink-300 shadow-xl",
      text: "text-gray-800",
      textSecondary: "text-gray-600",
      accent: "text-pink-600",
      button:
        "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white",
      header: "bg-gradient-to-r from-pink-500 to-purple-500 text-white",
      categoryTitle: "text-pink-700 border-b-2 border-pink-300",
      price: "text-emerald-600 font-bold",
      border: "border-pink-300",
    },
    style: {
      borderRadius: "rounded-3xl",
      fontFamily: "font-sans",
      cardStyle: "shadow-xl border-2",
      headerStyle: "text-center",
    },
  },
  {
    id: "rustico",
    name: "Rústico",
    description: "Cálido y tradicional",
    preview: "🏕️",
    classes: {
      bg: "bg-gradient-to-br from-amber-50 to-orange-100",
      card: "bg-white border-amber-300 shadow-md",
      text: "text-stone-800",
      textSecondary: "text-stone-600",
      accent: "text-amber-700",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
      header: "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
      categoryTitle: "text-amber-800 border-b-2 border-amber-300",
      price: "text-emerald-600 font-semibold",
      border: "border-amber-300",
    },
    style: {
      borderRadius: "rounded-lg",
      fontFamily: "font-serif",
      cardStyle: "shadow-md border-2",
      headerStyle: "text-left",
    },
  },
  {
    id: "premium",
    name: "Premium",
    description: "Lujo y exclusividad",
    preview: "👑",
    classes: {
      bg: "bg-gradient-to-br from-purple-50 to-violet-100",
      card: "bg-white border-purple-200 shadow-2xl",
      text: "text-zinc-800",
      textSecondary: "text-zinc-600",
      accent: "text-purple-600",
      button:
        "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white",
      header: "bg-gradient-to-r from-purple-600 to-violet-600 text-white",
      categoryTitle: "text-purple-700 border-b-2 border-purple-200",
      price: "text-amber-600 font-bold",
      border: "border-purple-200",
    },
    style: {
      borderRadius: "rounded-2xl",
      fontFamily: "font-sans",
      cardStyle: "shadow-2xl border-0",
      headerStyle: "text-center",
    },
  },
];

export const themeIds = menuThemes.map((theme) => theme.id);

export function getThemeById(id: string): MenuTheme {
  return menuThemes.find((theme) => theme.id === id) || menuThemes[0];
}

export function getDefaultTheme(): MenuTheme {
  return menuThemes[0];
}
