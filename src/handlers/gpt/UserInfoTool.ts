import { Injectable, Logger } from '@nestjs/common';
import UserService from 'src/modules/user/UserService';

export type UserInfo = {
    fullname: string;
    nickname?: string;
    email: string;
    birthdate: string;
};

@Injectable()
export default class UserInfoTool {
    private readonly logger: Logger = new Logger('UserInfoTool');

    constructor(private readonly userService: UserService) {}

    async getUserInfo(userEmail: string): Promise<UserInfo> {
        this.logger.log(`Fetching user info for email: ${userEmail}`);

        try {
            const data = await this.userService.getUserInfoByEmail(userEmail);

            this.logger.debug(`Received data: ${JSON.stringify(data)}`);

            return data;
        } catch (error) {
            this.logger.error(
                `Error fetching user info for email: ${userEmail}`,
                error.stack || error.message,
            );
            throw error;
        }
    }
}
