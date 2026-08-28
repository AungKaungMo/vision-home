export interface ApiResponse<T> {
  status: "success";
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}

export const success = <T>(data: T, message: string): ApiResponse<T> => {
  return { status: "success", message, data };
};

export const failure = (message: string): ApiErrorResponse => {
  return { status: "error", message };
};
