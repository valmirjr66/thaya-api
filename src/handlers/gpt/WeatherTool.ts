import { Injectable, Logger } from '@nestjs/common';

export type WeatherInfo = {
    currentTemperature: number;
    apparentTemperature: number;
    precipitationProbability: number;
};

@Injectable()
export default class WeatherTool {
    private readonly logger: Logger = new Logger('WeatherTool');

    async getWeatherInfo(args: {
        latitude: number;
        longitude: number;
    }): Promise<WeatherInfo> {
        const { latitude, longitude } = args;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            throw new Error('Latitude and longitude must be numbers');
        }

        this.logger.log(
            `Fetching user info for latitude ${latitude} and longitude ${longitude}`,
        );

        const apiURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,rain,precipitation_probability&timezone=America%2FSao_Paulo&past_days=1&forecast_days=1`;
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error(
                `Error fetching weather data: ${response.statusText}`,
            );
        }

        const data = await response.json();

        const currentDatetime = new Date();

        const hourlyIndex = data.hourly.time.findIndex((time: string) => {
            const date = new Date(time);
            return date.getTime() >= currentDatetime.getTime();
        });

        const currentTemperature = data.hourly.temperature_2m[hourlyIndex];
        const apparentTemperature =
            data.hourly.apparent_temperature[hourlyIndex];
        const precipitationProbability =
            data.hourly.precipitation_probability[hourlyIndex];

        return {
            currentTemperature,
            apparentTemperature,
            precipitationProbability,
        };
    }
}
