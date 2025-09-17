import { Injectable, Logger } from '@nestjs/common';
import BaseService from 'src/BaseService';
import { MONTHS_ABBREVIATION } from 'src/constants';
import TelegramHandler from 'src/handlers/messaging/TelegramHandler';
import AssistantService from '../assistant/AssistantService';
import CalendarService from '../calendar/CalendarService';
import UserService from '../user/UserService';

@Injectable()
export default class RoutinesService extends BaseService {
    private readonly logger: Logger = new Logger('RoutinesService');
    private readonly DAYS_TO_CHECK_AHEAD: number =
        Number(process.env.DAYS_TO_CHECK_AHEAD) || 7;

    constructor(
        private readonly telegramHandler: TelegramHandler,
        private readonly userService: UserService,
        private readonly calendarService: CalendarService,
        private readonly assistantService: AssistantService,
    ) {
        super();
    }

    async agendaReminder(): Promise<void> {
        this.logger.log('Fetching user list...');
        const { items: userList } = await this.userService.listUsers();
        this.logger.log(`Found ${userList.length} users.`);

        for (const user of userList) {
            this.logger.log(`Processing user: ${user.email}`);

            const today = new Date();
            this.logger.log(`Today's date: ${today.toISOString()}`);

            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            this.logger.log(
                `Current month: ${MONTHS_ABBREVIATION[currentMonth]}, year: ${currentYear}`,
            );

            this.logger.log(
                `Fetching calendar for ${user.email} for ${MONTHS_ABBREVIATION[currentMonth]} ${currentYear}`,
            );
            const { items: userCalendar } =
                await this.calendarService.getUserCalendarByUserId(
                    user.email,
                    MONTHS_ABBREVIATION[currentMonth],
                    currentYear,
                );
            this.logger.log(
                `Fetched ${userCalendar.length} events for current month.`,
            );

            const N_DaysLater = new Date(today);
            N_DaysLater.setDate(today.getDate() + this.DAYS_TO_CHECK_AHEAD);
            this.logger.log(
                `Checking events between ${today.toISOString()} and ${N_DaysLater.toISOString()}`,
            );

            let eventsToNotifyAbout = userCalendar.filter(
                (event) =>
                    event.datetime >= today && event.datetime <= N_DaysLater,
            );
            this.logger.log(
                `Found ${eventsToNotifyAbout.length} events in current month within range.`,
            );

            const daysInMonth = new Date(
                currentYear,
                currentMonth + 1,
                0,
            ).getDate();
            const daysLeftInMonth = daysInMonth - today.getDate();
            this.logger.log(`Days left in current month: ${daysLeftInMonth}`);

            if (daysLeftInMonth < this.DAYS_TO_CHECK_AHEAD) {
                const nextMonth = (currentMonth + 1) % 12;
                const nextYear =
                    nextMonth === 0 ? currentYear + 1 : currentYear;
                this.logger.log(
                    `Also checking next month: ${MONTHS_ABBREVIATION[nextMonth]} ${nextYear}`,
                );

                const { items: nextMonthCalendar } =
                    await this.calendarService.getUserCalendarByUserId(
                        user.email,
                        MONTHS_ABBREVIATION[nextMonth],
                        nextYear,
                    );
                this.logger.log(
                    `Fetched ${nextMonthCalendar.length} events for next month.`,
                );

                const nextMonthEvents = nextMonthCalendar.filter(
                    (event) =>
                        event.datetime > today && event.datetime <= N_DaysLater,
                );
                this.logger.log(
                    `Found ${nextMonthEvents.length} events in next month within range.`,
                );

                eventsToNotifyAbout =
                    eventsToNotifyAbout.concat(nextMonthEvents);
            }

            if (eventsToNotifyAbout.length > 0) {
                this.logger.log(
                    `User "${user.email}" has ${eventsToNotifyAbout.length} event(s) in the next ${this.DAYS_TO_CHECK_AHEAD} days. Sending WhatsApp notification.`,
                );

                const message =
                    await this.assistantService.composeRoutineMessage(
                        user.nickname || user.fullname,
                        `from ${today.toISOString().split('T')[0]} to ${N_DaysLater.toISOString().split('T')[0]}`,
                        eventsToNotifyAbout.map((item) => ({
                            datetime: item.datetime.toISOString(),
                            description: item.description,
                        })),
                    );

                if (user.telegramChatId) {
                    this.logger.log(
                        `Sending message to user with Telegram ID ${user.telegramChatId}:`,
                    );
                    this.logger.log(message);

                    await this.telegramHandler.sendMessage(
                        user.telegramChatId,
                        message,
                    );
                    this.logger.log(
                        `Message sent to Telegram ID ${user.telegramChatId}`,
                    );
                } else {
                    this.logger.log(
                        `No Telegram ID for user "${user.email}". Skipping Telegram message.`,
                    );
                }
            } else {
                this.logger.log(
                    `No events to notify for user "${user.email}".`,
                );
            }
        }

        this.logger.log('Finished processing all users');
    }
}
