import {
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { MONTHS_ABBREVIATION, RESPONSE_DESCRIPTIONS } from 'src/constants';
import { AbbreviatedMonth } from 'src/types/calendar';
import BaseController from '../../BaseController';
import CalendarService from './CalendarService';
import GetUserCalendarResponseDto from './dto/GetUserCalendarResponseDto';
import InsertCalendarOccurenceRequestDto from './dto/InsertCalendarOccurenceRequestDto';

@ApiTags('Calendar')
@Controller('calendar')
export default class CalendarController extends BaseController {
    constructor(private readonly calendarService: CalendarService) {
        super();
    }

    @Get('/calendar')
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getUserCalendar(
        @Headers('x-user-email') userEmail: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ): Promise<GetUserCalendarResponseDto> {
        if (!MONTHS_ABBREVIATION.includes(month as AbbreviatedMonth)) {
            throw new HttpException(
                'Month must be a valid abbreviated month (e.g., jan, feb, mar, etc.)',
                HttpStatus.BAD_REQUEST,
            );
        }

        const response = await this.calendarService.getUserCalendarByEmail(
            userEmail,
            month as AbbreviatedMonth,
            Number(year),
        );

        this.validateGetResponse(response);

        return response;
    }

    @Post('/calendar')
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async insertCalendarOccurrence(
        @Headers('x-user-email') userEmail: string,
        @Body() body: InsertCalendarOccurenceRequestDto,
    ): Promise<void> {
        await this.calendarService.insertCalendarOccurrence({
            ...body,
            userEmail,
        });
    }
}
