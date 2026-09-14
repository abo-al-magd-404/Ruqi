import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums";

// define required user roles for an endpoint
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
