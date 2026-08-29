import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../../modules/users/schemas/user.schema.js';
export declare class UsersSeed implements OnModuleInit {
    private readonly userModel;
    private readonly configService;
    constructor(userModel: Model<UserDocument>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private seedAdmin;
    private seedTeacher;
}
