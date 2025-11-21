export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
      message: string;
      code: number;
    };
    message?: string;
  }

export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
  }

export interface QueryParams extends PaginationParams {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
  }

