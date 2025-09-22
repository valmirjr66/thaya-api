import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import GetPrescriptionResponseDto from './dto/GetPrescriptionResponseDto';
import InsertPrescriptionRequestDto from './dto/InsertPrescriptionRequestDto';
import ListPrescriptionsResponseDto from './dto/ListPrescriptionsResponseDto';
import UpdatePrescriptionRequestDto from './dto/UpdatePrescriptionRequestDto';
import PrescriptionService from './PrescriptionService';

@ApiTags('Prescription')
@Controller('prescriptions')
export default class PrescriptionController {
    constructor(private readonly prescriptionService: PrescriptionService) {}

    @Get('/:id')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetPrescriptionResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getPrescriptionById(
        @Param('id') id: string,
    ): Promise<GetPrescriptionResponseDto> {
        const response = await this.prescriptionService.findById(id);
        return response;
    }

    @Delete('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deletePrescription(@Param('id') id: string): Promise<void> {
        await this.prescriptionService.delete(id);
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async postPrescription(
        @Body() body: InsertPrescriptionRequestDto,
    ): Promise<{ id: string }> {
        const response =
            await this.prescriptionService.insertPrescription(body);

        return response;
    }

    @Put('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updatePrescription(
        @Param('id') id: string,
        @Body() body: UpdatePrescriptionRequestDto,
    ): Promise<void> {
        await this.prescriptionService.update({ ...body, id });
    }

    @Get()
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListPrescriptionsResponseDto,
    })
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listPrescriptions(
        @Query() doctorId: string,
        @Query() patientId: string,
    ): Promise<ListPrescriptionsResponseDto> {
        const response = await this.prescriptionService.findAll({
            doctorId,
            patientId,
        });
        return response;
    }
}
