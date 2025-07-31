"use client";

import MenuItemCard from "./menu-item-card";

interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  views: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  items: MenuItem[];
  theme: {
    card: string;
    text: string;
    accent: string;
    button: string;
  };
}

export default function MenuItemList({ items, theme }: Props) {
  const handleClick = async (id: string) => {
    try {
      await fetch(`/api/public/restaurants/${id}/view`, { method: "POST" });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  return (
    <>
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          theme={theme}
          onClick={() => handleClick(item.id)}
        />
      ))}
    </>
  );
}
