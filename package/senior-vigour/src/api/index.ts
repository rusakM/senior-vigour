import axios, { type AxiosRequestConfig, type Method } from 'axios';

export async function getData<T>(
	url: string,
	headers?: AxiosRequestConfig['headers'],
): Promise<T> {
	try {
		const lsToken = localStorage.getItem('token');
		const response = await axios({
			method: 'GET',
			url,
			withCredentials: true,
			headers: {
				...headers,
				'Content-Type': 'application/json',
				Authorization: lsToken ? `Bearer ${lsToken}` : '',
			},
		});

		return response.data as T;
	} catch (error: unknown) {
		const err = error as { response?: { data?: unknown } };
		throw err?.response?.data || error;
	}
}

export async function sendData<T>(
	url: string,
	data: unknown,
	method: Method,
	headers?: AxiosRequestConfig['headers'],
): Promise<T> {
	try {
		const lsToken = localStorage.getItem('token');
		const response = await axios({
			data,
			headers: {
				...headers,
				'Content-Type': 'application/json',
				Authorization: lsToken ? `Bearer ${lsToken}` : '',
			},
			method,
			url,
			withCredentials: true,
		});
		return response.data as T;
	} catch (error: unknown) {
		const err = error as { response?: { data?: unknown } };
		throw err?.response?.data || error;
	}
}
