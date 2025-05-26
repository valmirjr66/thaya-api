import {
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Post,
    Put,
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
import UpdateUserRequestModel from './model/UpdateUserRequestModel';

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

    @Get('/info')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getUserInfo(
        @Headers('email') email?: string,
    ): Promise<GetUserInfoResponseDto> {
        const response = await this.userService.getUserInfo(email);
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

    @Put()
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiConflictResponse({ description: ResponseDescriptions.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async updateUser(@Body() body: UpdateUserRequestModel): Promise<void> {
        const response = await this.userService.updateUser(body);
        if (response === 'invalid email') {
            throw new HttpException(
                'E-mail already has an assigned account',
                HttpStatus.CONFLICT,
            );
        } else if (response === 'updated') {
            return;
        }
    }
}
