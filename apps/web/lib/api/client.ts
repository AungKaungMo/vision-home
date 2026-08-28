import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- Auth ---------------------------------------------------------------
// The Clerk token getter lives in React context, so it's registered once
// from <Providers>. The interceptor then attaches it to every request.
let getAuthToken: () => Promise<string | null> = async () => null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Errors -------------------------------------------------------------
// Surface the API's `{ status: "error", message }` body as a typed error.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) =>
    Promise.reject(
      new ApiError(
        error.response?.status ?? 0,
        error.response?.data?.message ?? error.message,
      ),
    ),
);

// --- Envelope -----------------------------------------------------------
// Every /api/v1 endpoint responds with `{ status, message, data }`.
// Strip it in a query fn:  api.get<ApiEnvelope<T>>("/x").then((res) => res.data.data)
export type ApiEnvelope<T> = { status: "success"; message: string; data: T };
