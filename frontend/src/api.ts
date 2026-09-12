const BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-BD3271504E07';

export const getToken = () => localStorage.getItem('access_token');
export const setToken = (token: string) => localStorage.setItem('access_token', token);
export const clearToken = () => localStorage.removeItem('access_token');

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-API-Key', API_KEY);
  
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && endpoint !== '/auth/login') {
    // Ideally we would hit /auth/refresh here using the refresh_token.
    // For simplicity, we just clear and force a re-login if it expires.
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
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
