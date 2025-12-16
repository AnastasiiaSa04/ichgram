import { Response } from 'express';

export class ApiResponse<T = any> {
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = 'Success'
  ) {}

  send(res: Response) {
    return res.status(this.statusCode).json({
      success: true,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    });
  }
}
