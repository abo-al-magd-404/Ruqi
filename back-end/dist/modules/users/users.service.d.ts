import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema.js';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    createStudent(data: {
        name: string;
        email: string;
        password: string;
        phoneNumber: string;
        address: string;
        educationalStageId?: string;
    }): Promise<UserDocument>;
    setEmailVerification(userId: string, data: {
        otpHash: string;
        expiresAt: Date;
        lastSentAt: Date;
    }): Promise<void>;
    activateUser(userId: string): Promise<UserDocument>;
    findById(userId: string): Promise<UserDocument | null>;
}
