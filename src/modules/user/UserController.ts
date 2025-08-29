import {
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Post,
    Put,
    Query,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { MONTHS_ABBREVIATION, RESPONSE_DESCRIPTIONS } from 'src/constants';
import { AbbreviatedMonth } from 'src/types/calendar';
import BaseController from '../../BaseController';
import CalendarService from './CalendarService';
import UserService from './UserService';
import AuthenticateUserRequestDto from './dto/AuthenticateUserRequestDto';
import ChangeProfilePictureRequestDto from './dto/ChangeProfilePictureRequestDto';
import GetUserCalendarResponseDto from './dto/GetUserCalendarResponseDto';
import GetUserInfoResponseDto from './dto/GetUserInfoResponseDto';
import InsertCalendarOccurenceRequestDto from './dto/InsertCalendarOccurenceRequestDto';
import InsertUserRequestDto from './dto/InsertUserRequestDto';
import ListUsersResponseDto from './dto/ListUsersResponseDto';
import UpdateUserRequestDto from './dto/UpdateUserRequestDto';

@ApiTags('User')
@Controller('user')
export default class UserController extends BaseController {
    constructor(
        private readonly userService: UserService,
        private readonly calendarService: CalendarService,
    ) {
        super();
    }

    @Post('/authenticate')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiBadRequestResponse({
        description: RESPONSE_DESCRIPTIONS.BAD_REQUEST,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async authenticateUser(
        @Body() dto: AuthenticateUserRequestDto,
    ): Promise<void> {
        const response = await this.userService.authenticateUser(dto);

        if (response === 'invalid credentials') {
            throw new HttpException(
                'Invalid credentials',
                HttpStatus.BAD_REQUEST,
            );
        } else if (response === 'authenticated') {
            return;
        } else {
            throw new HttpException(
                'E-mail is not registered',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('/change-password')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiBadRequestResponse({
        description: RESPONSE_DESCRIPTIONS.BAD_REQUEST,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async changePassword(
        @Headers('x-user-email') userEmail: string,
        @Query('newPassword') newPassword: string,
    ) {
        const response = await this.userService.changePassword(
            userEmail,
            newPassword,
        );

        if (response === 'email not found') {
            throw new HttpException(
                'E-mail is not registered',
                HttpStatus.BAD_REQUEST,
            );
        }

        return;
    }

    @Get('/info')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getUserInfo(
        @Headers('x-user-email') userEmail: string,
    ): Promise<GetUserInfoResponseDto> {
        const response = await this.userService.getUserInfoByEmail(userEmail);
        this.validateGetResponse(response);
        return response;
    }

    @Put('/profile-picture')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'profilePicture', maxCount: 1 }]),
    )
    @ApiBody({
        type: ChangeProfilePictureRequestDto,
    })
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async processArtifact(
        @Headers('x-user-email') userEmail: string,
        @UploadedFiles()
        files: {
            profilePicture: Express.Multer.File[];
        },
    ): Promise<void> {
        const { profilePicture } = files;

        await this.userService.changeProfilePicture(
            userEmail,
            profilePicture[0],
        );
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async insertUser(@Body() body: InsertUserRequestDto): Promise<void> {
        const response = await this.userService.insertUser(body);
        if (response === 'existing email') {
            throw new HttpException(
                'E-mail already has an assigned account',
                HttpStatus.CONFLICT,
            );
        } else if (response === 'inserted') {
            return;
        }
    }

    @Put('/info')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateUser(
        @Headers('x-user-email') userEmail: string,
        @Body() body: UpdateUserRequestDto,
    ): Promise<void> {
        const response = await this.userService.updateUser({
            ...body,
            email: userEmail,
        });

        if (response === 'invalid email') {
            throw new HttpException(
                "E-mail doesn't have an assigned account",
                HttpStatus.CONFLICT,
            );
        } else if (response === 'updated') {
            return;
        }
    }

    @Get('/list')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listUsers(): Promise<ListUsersResponseDto> {
        const response = await this.userService.listUsers();
        this.validateGetResponse(response);
        return response;
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
