import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type UserInfo = {
    fullname: string;
    nickname?: string;
    email: string;
    birthdate: string;
    currentLocation: {
        country: string;
        state: string;
        city: string;
        longitude: number;
        latitute: number;
    };
};

@Injectable()
export default class UserInfoTool {
    private readonly logger: Logger = new Logger('UserInfoTool');

    async getUserInfo(userEmail: string): Promise<UserInfo> {
        this.logger.log(`Fetching user info for email: ${userEmail}`);

        try {
            const getUserInfoUrl = `${process.env.USER_MODULE_ADDRESS}/info`;
            this.logger.debug(
                `Sending GET request to ${getUserInfoUrl} with x-user-email: ${userEmail}`,
            );
            const { data } = await axios.get(getUserInfoUrl, {
                headers: { 'x-user-email': userEmail },
            });
            this.logger.debug(`Received data: ${JSON.stringify(data)}`);

            const userInfo: UserInfo = {
                ...data,
                currentLocation: {
                    country: 'Brazil',
                    state: 'Bahia',
                    city: 'Salvador',
                    longitude: -38.4812772,
                    latitute: -12.9822499,
                },
            };

            this.logger.log(
                `User info successfully fetched for email: ${userEmail}`,
            );
            return userInfo;
        } catch (error) {
            this.logger.error(
                `Error fetching user info for email: ${userEmail}`,
                error.stack || error.message,
            );
            throw error;
        }
    }
}
