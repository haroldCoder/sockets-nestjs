import { HttpStatus } from "@nestjs/common";

export class ResponseClient {
  constructor(
    public readonly status: HttpStatus,
    public readonly message: string,
    public readonly data: any,
  ) {}
}