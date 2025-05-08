import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Prepend API_BASE_URL if url doesn't start with http or https
  const fullUrl = (url.startsWith('http://') || url.startsWith('https://')) 
    ? url 
    : `${API_BASE_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    credentials: "include",
    ...options
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Prepend API_BASE_URL if url doesn't start with http or https
    const url = queryKey[0] as string;
    const fullUrl = (url.startsWith('http://') || url.startsWith('https://')) 
      ? url 
      : `${API_BASE_URL}${url}`;
      
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
