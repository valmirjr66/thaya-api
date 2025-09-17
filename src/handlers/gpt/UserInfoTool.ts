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

    async getUserInfo(userId: string): Promise<UserInfo> {
        this.logger.log(`Fetching user info for id: ${userId}`);

        try {
            const data = await this.userService.getUserInfoById(userId);

            this.logger.debug(`Received data: ${JSON.stringify(data)}`);

            return data;
        } catch (error) {
            this.logger.error(
                `Error fetching user info for id: ${userId}`,
                error.stack || error.message,
            );
            throw error;
        }
    }
}
