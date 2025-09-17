import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MONTHS_ABBREVIATION, RESPONSE_DESCRIPTIONS } from 'src/constants';
import { AbbreviatedMonth } from 'src/types/calendar';
import BaseController from '../../BaseController';
import CalendarService from './CalendarService';
import GetUserCalendarResponseDto from './dto/GetUserCalendarResponseDto';
import InsertCalendarOccurenceRequestDto from './dto/InsertCalendarOccurenceRequestDto';
import UpdateCalendarOccurenceRequestDto from './dto/UpdateCalendarOccurenceRequestDto';

@ApiTags('Calendar')
@Controller('calendar/occurrences')
export default class CalendarController extends BaseController {
    constructor(private readonly calendarService: CalendarService) {
        super();
    }

    @Get()
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getUserCalendar(
        @Query('userId') userId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ): Promise<GetUserCalendarResponseDto> {
        if (!MONTHS_ABBREVIATION.includes(month as AbbreviatedMonth)) {
            throw new HttpException(
                'Month must be a valid abbreviated month (e.g., jan, feb, mar, etc.)',
                HttpStatus.BAD_REQUEST,
            );
        }

        const response = await this.calendarService.getUserCalendarByUserId(
            userId,
            month as AbbreviatedMonth,
            Number(year),
        );

        this.validateGetResponse(response);

        return response;
    }

    @Post()
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async insertCalendarOccurrence(
        @Body() body: InsertCalendarOccurenceRequestDto,
    ): Promise<void> {
        await this.calendarService.insertCalendarOccurrence(body);
    }

    @Delete(':id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deleteCalendarOccurrence(@Param('id') id: string): Promise<void> {
        await this.calendarService.deleteCalendarOccurrence(id);
    }

    @Put(':id')
    @ApiUnauthorizedResponse({
        description: RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
    })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateCalendarOccurrence(
        @Param('id') id: string,
        @Body() body: UpdateCalendarOccurenceRequestDto,
    ): Promise<void> {
        await this.calendarService.updateCalendarOccurrence({
            ...body,
            id,
        });
    }
}
