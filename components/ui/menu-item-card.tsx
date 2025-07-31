"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Star } from "lucide-react";
import Image from "next/image";

interface Theme {
  card: string;
  text: string;
  accent: string;
  button: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  ingredients?: string[] | null;
  allergens?: string[] | null;
  is_featured?: boolean;
  views?: number;
}

interface MenuItemCardProps {
  item: MenuItem;
  theme: Theme;
  onClick?: () => void;
}

export default function MenuItemCard({
  item,
  theme,
  onClick,
}: MenuItemCardProps) {
  return (
    <Card
      key={item.id}
      className={`${theme.card} hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {item.image_url && (
            <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-semibold ${theme.text}`}>
                  {item.name}
                </h3>
                {item.is_featured && (
                  <Badge className={`${theme.button} text-xs`}>
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${theme.accent}`}>
                  ${item.price.toLocaleString()}
                </span>
                {item.views && item.views > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    {item.views}
                  </Badge>
                )}
              </div>
            </div>

            {item.description && (
              <p
                className={`${theme.text} opacity-80 text-sm md:text-base mb-2`}
              >
                {item.description}
              </p>
            )}

            {item.ingredients && item.ingredients?.length > 0 && (
              <div className="mb-2">
                <p className={`text-xs ${theme.text} opacity-60 mb-1`}>
                  Ingredientes:
                </p>
                <p className={`text-sm ${theme.text} opacity-80`}>
                  {item.ingredients.join(", ")}
                </p>
              </div>
            )}

            {item.allergens && item.allergens?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.allergens.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="text-xs">
                    {allergen}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
