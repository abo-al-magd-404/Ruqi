import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// protect endpoints using JWT authentication
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
