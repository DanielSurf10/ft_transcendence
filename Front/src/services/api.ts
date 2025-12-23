const BASE_URL = import.meta.env.VITE_API_URL

if (!BASE_URL) {
	throw new Error("VITE_API_URL is not defined in environment variables");
}

interface RequestOptions extends RequestInit {
	body?: any;
}

async function fetchWrapper<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
	const url = `${BASE_URL}${endpoint}`;

	const headers: HeadersInit = {
		"Content-type": "application/json",
		...options.headers as any
	};

	const token = localStorage.getItem('token');
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const config: RequestInit = {
		...options,
		headers,
		body: options.body ? JSON.stringify(options.body) : undefined,
	};

	console.log(url);
	console.log(config);

	// try {
		const response = await fetch(url, config);

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			throw new Error(errorBody.error || `Erro HTTP: ${errorBody.status}`);
		}

		return await response.json();
	// } 
	// catch (error) {
	// 	throw error;
	// }
}

export const api = {
	get: <T>(endpoint: string) => fetchWrapper<T>(endpoint, { method: "GET" }),
	post: <T>(endpoint: string, body: any) => fetchWrapper<T>(endpoint, { method: "POST", body }),
	put: <T>(endpoint: string, body: any) => fetchWrapper<T>(endpoint, { method: "PUT", body }),
	delete: <T>(endpoint: string) => fetchWrapper<T>(endpoint, { method: "DELETE" }),
	request: fetchWrapper
};
