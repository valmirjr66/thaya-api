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

        const { data } = await axios.get(
            `${process.env.USER_MODULE_ADDRESS}/info`,
            {
                headers: { 'x-user-email': userEmail },
            },
        );

        return {
            ...data,
            currentLocation: {
                country: 'Brazil',
                state: 'Bahia',
                city: 'Salvador',
                longitude: -38.4812772,
                latitute: -12.9822499,
            },
        };
    }
}
