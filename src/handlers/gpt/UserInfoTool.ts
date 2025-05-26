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
    currentDatetime: Date;
};

export async function getUserInfo(): Promise<UserInfo> {
    return {
        fullname: 'Valmir Júnior',
        nickname: 'Val',
        email: 'valmirgmj@gmail.com',
        birthdate: '2000-04-13',
        currentLocation: {
            country: 'Brazil',
            state: 'Bahia',
            city: 'Salvador',
            longitude: -38.4812772,
            latitute: -12.9822499,
        },
        currentDatetime: new Date(),
    };
}
