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
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import BaseController from '../../BaseController';
import UserService from './UserService';
import AuthenticateUserRequestDto from './dto/AuthenticateUserRequestDto';
import ChangeProfilePictureRequestDto from './dto/ChangeProfilePictureRequestDto';
import GetUserInfoResponseDto from './dto/GetUserInfoResponseDto';
import InsertUserRequestDto from './dto/InsertUserRequestDto';
import ListUsersResponseDto from './dto/ListUsersResponseDto';
import UpdateUserRequestDto from './dto/UpdateUserRequestDto';

@ApiTags('User')
@Controller('users')
export default class UserController extends BaseController {
    constructor(private readonly userService: UserService) {
        super();
    }

    @Post('/authenticate')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        schema: { example: { id: 'string' } },
    })
    @ApiBadRequestResponse({
        description: RESPONSE_DESCRIPTIONS.BAD_REQUEST,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async authenticateUser(
        @Body() dto: AuthenticateUserRequestDto,
    ): Promise<{ id: string }> {
        const response = await this.userService.authenticateUser(dto);

        if (response === 'invalid credentials') {
            throw new HttpException(
                'Invalid credentials',
                HttpStatus.BAD_REQUEST,
            );
        } else if (response === 'email not found') {
            throw new HttpException(
                'E-mail is not registered',
                HttpStatus.BAD_REQUEST,
            );
        } else {
            return response;
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
        @Query('userEmail') userEmail: string,
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

    @Get('/:id')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetUserInfoResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getUserInfoById(
        @Param('id') id: string,
    ): Promise<GetUserInfoResponseDto> {
        const response = await this.userService.getUserInfoById(id);
        this.validateGetResponse(response);
        return response;
    }

    @Put('/:id/profile-picture')
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
    async changeProfilePicture(
        @Param('id') userId: string,
        @UploadedFiles()
        files: {
            profilePicture: Express.Multer.File[];
        },
    ): Promise<void> {
        const { profilePicture } = files;

        await this.userService.changeProfilePicture({
            userId,
            profilePicture: profilePicture[0],
        });
    }

    @Delete('/:id/profile-picture')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async removeProfilePicture(@Param('id') id: string): Promise<void> {
        await this.userService.removeProfilePicture(id);
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

    @Put('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateUser(
        @Param('id') id: string,
        @Body() body: UpdateUserRequestDto,
    ): Promise<void> {
        await this.userService.updateUser({
            ...body,
            id,
        });
    }

    @Get()
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
}
