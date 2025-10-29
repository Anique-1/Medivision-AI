import { toast } from "@/components/ui/use-toast"

const API_BASE_URL = "http://localhost:8000/api"

interface RequestOptions extends RequestInit {
  token?: string
}

export async function fetchWithAuth(endpoint: string, options: RequestOptions = {}) {
  const token = options.token || localStorage.getItem("access_token")
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>), // Cast options.headers to Record<string, string>
  }

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}` // Use dot notation for clarity
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Unauthorized, token might be expired or invalid
    localStorage.removeItem("access_token")
    toast({
      title: "Session Expired",
      description: "Please log in again.",
      variant: "destructive",
    })
    // Redirect to login page - this would typically be handled by a global router instance or context
    // For now, we'll rely on the page-level handling or a full page reload
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred" }))
    throw new Error(errorData.detail || `API error: ${response.statusText}`)
  }

  return response.json()
}
