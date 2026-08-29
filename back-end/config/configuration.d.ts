declare const _default: () => {
    port: number;
    database: {
        mongodbUri: string | undefined;
    };
    jwt: {
        access: {
            secret: string | undefined;
            expiresIn: number;
        };
        refresh: {
            secret: string | undefined;
            expiresIn: number;
        };
    };
    seed: {
        admin: {
            name: string | undefined;
            email: string | undefined;
            password: string | undefined;
            phoneNumber: string | undefined;
            address: string | undefined;
        };
        teacher: {
            name: string | undefined;
            email: string | undefined;
            password: string | undefined;
            phoneNumber: string | undefined;
            address: string | undefined;
        };
    };
    mail: {
        host: string | undefined;
        port: number;
        user: string | undefined;
        password: string | undefined;
        from: string | undefined;
    };
    emailVerification: {
        otpExpiresIn: string | undefined;
        otpResendCooldown: string | undefined;
    };
};
export default _default;
