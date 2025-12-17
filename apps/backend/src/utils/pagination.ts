export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class PaginationHelper {
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static getTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  static createResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginationResult<T> {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: this.getTotalPages(total, limit),
      },
    };
  }

  static validateOptions(options: PaginationOptions): { page: number; limit: number } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    return { page, limit };
  }
}
