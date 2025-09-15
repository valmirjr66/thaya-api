import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import BaseController from '../../BaseController';
import GetUserCalendarResponseDto from './dto/GetOrganizationByIdResponseDto';
import InsertOrganizationRequestDto from './dto/InsertOrganizationRequestDto';
import ListOrganizationsResponseDto from './dto/ListOrganizationsResponseDto';
import OrganizationService from './OrganizationService';

@ApiTags('Organization')
@Controller('organizations')
export default class OrganizationController extends BaseController {
    constructor(private readonly organizationService: OrganizationService) {
        super();
    }

    @Get(':id')
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getOrganizationById(
        @Param('id') id: string,
    ): Promise<GetUserCalendarResponseDto> {
        const response = await this.organizationService.getOrganizationById(id);
        this.validateGetResponse(response);
        return response;
    }

    @Get()
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listOrganizations(): Promise<ListOrganizationsResponseDto> {
        const response = await this.organizationService.listOrganizations();
        this.validateGetResponse(response);
        return response;
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async insertUser(
        @Body() body: InsertOrganizationRequestDto,
    ): Promise<void> {
        await this.organizationService.insertOrganization(body);
    }
}
