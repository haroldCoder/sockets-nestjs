import { ResponseClient } from "src/shared/dto/responseClient";
import { User } from "../domain/user.entity";
import { DomainUserService } from "../domain/user.service";
import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class UserRegisterService {
  constructor(private readonly domainUserService: DomainUserService) {}

  async execute(data: User): Promise<ResponseClient> {
    try{
        const result: ResponseClient = await this.domainUserService.register(data);
        return result;
    }
    catch(error){
        console.error('Error during registration:', error);
        return new ResponseClient(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred", null);
    }
  }
}