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
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import CalendarService from './CalendarService';
import UserService from './UserService';
import AuthenticateUserRequestDto from './dto/AuthenticateUserRequestDto';
import ChangeProfilePictureRequestDto from './dto/ChangeProfilePictureRequestDto';
import GetUserCalendarResponseDto from './dto/GetUserCalendarResponseDto';
import GetUserInfoResponseDto from './dto/GetUserInfoResponseDto';
import InsertCalendarOccurenceRequestDto from './dto/InsertCalendarOccurenceRequestDto';
import InsertUserRequestDto from './dto/InsertUserRequestDto';
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
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiBadRequestResponse({
        description: ResponseDescriptions.BAD_REQUEST,
    })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiBadRequestResponse({
        description: ResponseDescriptions.BAD_REQUEST,
    })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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
    @ApiCreatedResponse({ description: ResponseDescriptions.CREATED })
    @ApiBadRequestResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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
    @ApiCreatedResponse({ description: ResponseDescriptions.CREATED })
    @ApiConflictResponse({ description: ResponseDescriptions.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiConflictResponse({ description: ResponseDescriptions.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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

    @Get('/calendar')
    @ApiNoContentResponse({ description: ResponseDescriptions.NO_CONTENT })
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getUserCalendar(
        @Headers('x-user-email') userEmail: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ): Promise<GetUserCalendarResponseDto> {
        const response = await this.calendarService.getUserCalendarByEmail(
            userEmail,
            Number(month),
            Number(year),
        );

        this.validateGetResponse(response);

        return response;
    }

    @Post('/calendar')
    @ApiBadRequestResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
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
