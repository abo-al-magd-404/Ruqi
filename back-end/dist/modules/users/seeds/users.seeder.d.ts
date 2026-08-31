import { OnApplicationBootstrap } from '@nestjs/common';
import { UserDocument } from '../../../schemas/user.schema.js';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
export declare class UsersSeeder implements OnApplicationBootstrap {
    private readonly userModel;
    private readonly configService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, configService: ConfigService);
    onApplicationBootstrap(): Promise<void>;
    private seedAdmin;
    private seedTeacher;
}
