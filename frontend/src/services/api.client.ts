import { env } from '../config/env';
import { ApiResponse } from '../types/api.types';

export class ApiError extends Error {
  public code: string;
  public details?: unknown;
  public status: number;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

let authTokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  authTokenGetter = getter;
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export const apiClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { params, headers = {}, ...customConfig } = options;

  let url = `${env.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const requestHeaders = new Headers(headers);

  // Attach auth token if available from Clerk
  if (authTokenGetter) {
    try {
      const token = await authTokenGetter();
      if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // Ignore token fetch errors in mock mode
    }
  }

  // If no auth token is set and in dev mode, provide developer mock user header
  if (!requestHeaders.has('Authorization') && env.isDev) {
    requestHeaders.set('x-mock-user-id', 'user_srushti_patil');
  }

  // Set default JSON Content-Type only if not already set (e.g. FormData sets its own boundary)
  if (!(customConfig.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
    });

    const contentType = response.headers.get('content-type');

    // Handle PDF or binary blob downloads
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
      if (!response.ok) {
        throw new ApiError(
          `Failed to download file: ${response.statusText}`,
          `HTTP_${response.status}`,
          response.status
        );
      }
      const blob = await response.blob();
      return blob as unknown as T;
    }

    // Handle CSV or text blob downloads
    if (contentType && (contentType.includes('text/csv') || contentType.includes('text/plain'))) {
      if (!response.ok) {
        throw new ApiError(
          `Failed to download CSV data: ${response.statusText}`,
          `HTTP_${response.status}`,
          response.status
        );
      }
      const text = await response.text();
      return text as unknown as T;
    }

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
      const errorDetail = !json.success ? json.error : null;
      throw new ApiError(
        errorDetail?.message || response.statusText || 'An unexpected API error occurred',
        errorDetail?.code || `HTTP_${response.status}`,
        response.status,
        errorDetail?.details
      );
    }

    return json.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new ApiError(`Network or API connection error: ${message}`, 'NETWORK_ERROR', 0);
  }
};
