export type UserInfo = {
  fullname: string;
  nickname: string;
  email: string;
  age: number;
  languages: string[];
  origin: {
    country: string;
    state: string;
    city: string;
    longitude: number;
    latitute: number;
  };
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
    fullname: "Valmir Júnior",
    nickname: "Val",
    email: "valmirgmj@gmail.com",
    age: 25,
    languages: ["Portuguese", "English"],
    origin: {
      country: "Brazil",
      state: "Minas Gerais",
      city: "Itaúna",
      longitude: -44.5960667,
      latitute: -20.0880499,
    },
    currentLocation: {
      country: "Brazil",
      state: "Bahia",
      city: "Salvador",
      longitude: -38.4812772,
      latitute: -12.9822499,
    },
    currentDatetime: new Date(),
  };
}
