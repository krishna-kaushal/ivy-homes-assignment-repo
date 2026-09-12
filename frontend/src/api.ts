const BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-BD3271504E07';

export const getToken = () => localStorage.getItem('access_token');
export const setToken = (token: string) => localStorage.setItem('access_token', token);
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setRefreshToken = (token: string) => localStorage.setItem('refresh_token', token);
export const clearToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    setToken(data.access_token);
    if (data.refresh_token) setRefreshToken(data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-API-Key', API_KEY);
  
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint}`;
  
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, attempt silent refresh and retry once
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = silentRefresh();
    }
    const newToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newToken) {
      // Retry the original request with the new token
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set('X-API-Key', API_KEY);
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      // Refresh failed — force re-login
      clearToken();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  login: (email: string, password: string) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),
  
  logout: () => {
    // Call server logout then clear local token
    fetchAPI('/auth/logout', { method: 'POST' }).catch(() => {});
    clearToken();
  },

  // Note: We use offset instead of page, due to API lies discovered
  getListings: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    return fetchAPI(`/v1/listings?${searchParams.toString()}`);
  },

  getListing: (id: string) => fetchAPI(`/v1/listings/${id}`),

  getRental: (id: string) => fetchAPI(`/v1/rentals/${id}`),

  getProject: (id: string) => fetchAPI(`/v1/projects/${id}`),
  
  getRentals: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    return fetchAPI(`/v1/rentals?${searchParams.toString()}`);
  },

  getProjects: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    return fetchAPI(`/v1/projects?${searchParams.toString()}`);
  },

  getFavourites: () => fetchAPI('/v1/saved'),
  
  addFavourite: (id: string) => fetchAPI('/v1/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listing_id: id })
  }),

  removeFavourite: (id: string) => fetchAPI(`/v1/saved/${id}`, {
    method: 'DELETE'
  }),
};
