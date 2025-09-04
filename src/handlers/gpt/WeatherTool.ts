import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

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

        this.logger.debug(
            `Received args: latitude=${latitude}, longitude=${longitude}`,
        );

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            this.logger.error('Latitude and longitude must be numbers');
            throw new Error('Latitude and longitude must be numbers');
        }

        this.logger.log(
            `Fetching weather info for latitude ${latitude} and longitude ${longitude}`,
        );

        const apiURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,rain,precipitation_probability&timezone=America%2FSao_Paulo&past_days=1&forecast_days=1`;
        this.logger.debug(`Constructed API URL: ${apiURL}`);

        try {
            const { status, data } = await axios.get(apiURL);

            this.logger.debug(`API response status: ${status}`);

            if (status < 200 || status >= 300) {
                this.logger.error(
                    `Error fetching weather data with status code: ${status}`,
                );
                throw new Error(
                    `Error fetching weather data with following status code: ${status}`,
                );
            }

            const currentDatetime = new Date();
            this.logger.debug(
                `Current datetime: ${currentDatetime.toISOString()}`,
            );

            const hourlyIndex = data.hourly.time.findIndex((time: string) => {
                const date = new Date(time);
                return date.getTime() >= currentDatetime.getTime();
            });

            this.logger.debug(`Matched hourly index: ${hourlyIndex}`);

            const currentTemperature = data.hourly.temperature_2m[hourlyIndex];
            const apparentTemperature =
                data.hourly.apparent_temperature[hourlyIndex];
            const precipitationProbability =
                data.hourly.precipitation_probability[hourlyIndex];

            this.logger.log(
                `Weather info - Current: ${currentTemperature}, Apparent: ${apparentTemperature}, Precipitation Probability: ${precipitationProbability}`,
            );

            return {
                currentTemperature,
                apparentTemperature,
                precipitationProbability,
            };
        } catch (error) {
            this.logger.error(`Exception occurred: ${error}`);
            throw error;
        }
    }
}
