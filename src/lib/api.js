const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
};

export const fetchProducts = async () => apiRequest('/products');
