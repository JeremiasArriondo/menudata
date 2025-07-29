import type { NextRequest } from "next/server"
import { supabase } from "./supabase"

export async function getAuthenticatedUser(request: NextRequest) {
  if (!supabase) {
    return { user: null, error: "Supabase not configured" }
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "No authorization header" }
  }

  const token = authHeader.substring(7)

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { user: null, error: "Invalid token" }
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: "Authentication failed" }
  }
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, { status })
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
