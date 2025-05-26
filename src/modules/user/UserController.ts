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
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import UserService from './UserService';
import GetUserInfoResponseDto from './dto/GetUserInfoResponseDto';
import InsertUserRequestDto from './dto/InsertUserRequestDto';
import UpdateUserRequestModel from './model/UpdateUserRequestModel';

@ApiTags('User')
@Controller('user')
export default class UserController extends BaseController {
    constructor(private readonly userService: UserService) {
        super();
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
