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
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import UserService from './UserService';
import AuthenticateUserRequestDto from './dto/AuthenticateUserRequestDto';
import GetUserInfoResponseDto from './dto/GetUserInfoResponseDto';
import InsertUserRequestDto from './dto/InsertUserRequestDto';
import UpdateUserRequestDto from './dto/UpdateUserRequestDto';

@ApiTags('User')
@Controller('user')
export default class UserController extends BaseController {
    constructor(private readonly userService: UserService) {
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
        @Headers('userEmail') userEmail: string,
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
        @Headers('userEmail') userEmail: string,
    ): Promise<GetUserInfoResponseDto> {
        const response = await this.userService.getUserInfoByEmail(userEmail);
        this.validateGetResponse(response);
        return response;
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
        @Headers('userEmail') userEmail: string,
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
}
