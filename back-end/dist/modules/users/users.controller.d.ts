import { UsersService } from './users.service.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateStudentProfile(req: any, updateStudentProfileDto: UpdateStudentProfileDto): Promise<{
        message: string;
        user: import("mongoose").Document<unknown, {}, import("../../schemas/user.schema.js").User, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/user.schema.js").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
}
