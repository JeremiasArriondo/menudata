"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  restaurantId: string;
}

export default function ViewTracker({ restaurantId }: ViewTrackerProps) {
  useEffect(() => {
    // Registrar vista del restaurante
    const trackView = async () => {
      try {
        await fetch(`/api/public/restaurants/${restaurantId}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [restaurantId]);

  return null;
}
