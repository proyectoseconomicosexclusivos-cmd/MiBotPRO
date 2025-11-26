// Fix: Resolve TypeScript error for `import.meta.env` by simplifying the constant.
// The original logic `import.meta.env.DEV ? '' : ''` always results in an empty string,
// which is what's needed for both development (with proxy) and production (same origin).
const API_URL = ''; // In dev, proxy handles it. In prod, it's the same origin.

const getAuthToken = () => localStorage.getItem('mibotpro_token');

const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }

    if (response.status === 204) { // No Content
        return null;
    }
    
    return response.json();
};

export default request;