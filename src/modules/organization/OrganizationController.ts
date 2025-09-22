import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import ChangeProfilePictureRequestDto from './dto/ChangeProfilePictureRequestDto';
import GetOrganizationByIdResponseDto from './dto/GetOrganizationByIdResponseDto';
import InsertOrganizationRequestDto from './dto/InsertOrganizationRequestDto';
import ListOrganizationsResponseDto from './dto/ListOrganizationsResponseDto';
import UpdateOrganizationRequestDto from './dto/UpdateOrganizationRequestDto';
import OrganizationService from './OrganizationService';

@ApiTags('Organization')
@Controller('organizations')
export default class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Get(':id')
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetOrganizationByIdResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getOrganizationById(
        @Param('id') id: string,
    ): Promise<GetOrganizationByIdResponseDto> {
        const response = await this.organizationService.getOrganizationById(id);
        return response;
    }

    @Get()
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListOrganizationsResponseDto,
    })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listOrganizations(): Promise<ListOrganizationsResponseDto> {
        const response = await this.organizationService.listOrganizations();
        return response;
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async insertOrganization(
        @Body() body: InsertOrganizationRequestDto,
    ): Promise<{ id: string }> {
        return await this.organizationService.insertOrganization(body);
    }

    @Delete(':id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deleteCalendarOccurrence(@Param('id') id: string): Promise<void> {
        await this.organizationService.deleteOrganizationById(id);
    }

    @Put(':id')
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateOrganization(
        @Param('id') id: string,
        @Body() body: UpdateOrganizationRequestDto,
    ): Promise<void> {
        await this.organizationService.updateOrganization({ ...body, id });
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
        @Param('id') organizationId: string,
        @UploadedFiles()
        files: {
            profilePicture: Express.Multer.File[];
        },
    ): Promise<void> {
        const { profilePicture } = files;

        await this.organizationService.changeProfilePicture({
            organizationId,
            profilePicture: profilePicture[0],
        });
    }

    @Delete('/:id/profile-picture')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async removeProfilePicture(@Param('id') id: string): Promise<void> {
        await this.organizationService.removeProfilePicture(id);
    }
}
