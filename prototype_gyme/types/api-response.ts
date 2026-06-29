export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}