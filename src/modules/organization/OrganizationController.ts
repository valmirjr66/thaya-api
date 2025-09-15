import { Controller, Get, Param } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import BaseController from '../../BaseController';
import GetUserCalendarResponseDto from './dto/GetOrganizationByIdResponseDto';
import ListOrganizationsResponseDto from './dto/ListOrganizationsResponseDto';
import OrganizationService from './OrganizationService';

@ApiTags('Organization')
@Controller('organizations')
export default class OrganizationController extends BaseController {
    constructor(private readonly organizationService: OrganizationService) {
        super();
    }

    @Get(':id')
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
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
}
