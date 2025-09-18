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
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import BaseController from '../../../BaseController';
import AuthenticateUserRequestDto from '../dto/AuthenticateUserRequestDto';
import ChangeProfilePictureRequestDto from '../dto/ChangeProfilePictureRequestDto';
import GetPatientInfoResponseDto from '../dto/patient/GetPatientUserInfoResponseDto';
import InsertPatientUserRequestDto from '../dto/patient/InsertPatientUserRequestDto';
import ListPatientUsersInfoResponseDto from '../dto/patient/ListPatientUsersInfoResponseDto';
import UpdatePatientUserRequestDto from '../dto/patient/UpdatePatientUserRequestDto';
import PatientUserService from '../PatientUserService';

@ApiTags('User')
@Controller('patient-users')
export default class PatientUserController extends BaseController {
    constructor(private readonly patientUserService: PatientUserService) {
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
        const response = await this.patientUserService.authenticateUser(dto);

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
        const response = await this.patientUserService.changePassword(
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
        type: GetPatientInfoResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getUserInfoById(
        @Param('id') id: string,
    ): Promise<GetPatientInfoResponseDto> {
        const response = await this.patientUserService.getUserInfoById(id);
        this.validateGetResponse(response);
        return response;
    }

    @Delete('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deleteUserById(@Param('id') id: string): Promise<void> {
        await this.patientUserService.deleteUserById(id);
    }

    @Put('/:id/profile-picture')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'profilePicture', maxCount: 1 }]),
    )
    @ApiBody({
        type: ChangeProfilePictureRequestDto,
    })
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.OK })
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

        await this.patientUserService.changeProfilePicture({
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
        await this.patientUserService.removeProfilePicture(id);
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async insertUser(@Body() body: InsertPatientUserRequestDto): Promise<void> {
        const response = await this.patientUserService.insertUser(body);
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
        @Body() body: UpdatePatientUserRequestDto,
    ): Promise<void> {
        await this.patientUserService.updateUser({ ...body, id });
    }

    @Get()
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListPatientUsersInfoResponseDto,
    })
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listUsers(): Promise<ListPatientUsersInfoResponseDto> {
        const response = await this.patientUserService.listUsers();
        this.validateGetResponse(response);
        return response;
    }
}
