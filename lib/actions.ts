export async function incrementViewCount(itemId: string) {
  try {
    await fetch(`/api/public/restaurants/${itemId}/view`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
}
