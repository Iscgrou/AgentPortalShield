import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(url: string, options: ApiRequestOptions = {}): Promise<any> {
  console.log(`SHERLOCK v12.1: Fetching URL:`, url);

  const config: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(url, config);

    console.log(`SHERLOCK v12.1 DEBUG: Response status for ${url}:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}) for ${url}:`, errorText);

      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        window.location.href = '/login';
        return null;
      }

      throw new Error(`HTTP ${response.status}: ${errorText || 'Network Error'}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Non-JSON response for ${url}:`, contentType);
      const text = await response.text();
      console.log('Response text:', text);
      return text;
    }

    const data = await response.json();
    console.log(`SHERLOCK v12.1 DEBUG: Successful response for ${url}:`, {
      dataType: Array.isArray(data) ? 'array' : typeof data,
      length: Array.isArray(data) ? data.length : Object.keys(data || {}).length
    });

    return data;
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // SHERLOCK v12.1: Handle query parameters properly
    let url = queryKey[0] as string;

    // If there are query parameters (second element), build query string
    if (queryKey.length > 1 && queryKey[1] && typeof queryKey[1] === 'object') {
      const params = queryKey[1] as Record<string, any>;
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    console.log('SHERLOCK v12.1: Fetching URL:', url);

    const res = await fetch(url, {
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