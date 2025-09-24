import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
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
import GetPatientRecordResponseDto from './dto/GetPatientRecordResponseDto';
import InsertPatientRecordRequestDto from './dto/InsertPatientRecordRequestDto';
import ListPatientRecordsResponseDto from './dto/ListPatientRecordsResponseDto';
import UpdatePatientRecordRequestDto from './dto/UpdatePatientRecordRequestDto';
import PatientRecordService from './PatientRecordService';

@ApiTags('Patient Record')
@Controller('patient-records')
export default class PatientRecordController {
    constructor(private readonly patientRecordService: PatientRecordService) {}

    @Get('/:id')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetPatientRecordResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getPatientRecordById(
        @Param('id') id: string,
    ): Promise<GetPatientRecordResponseDto> {
        const response = await this.patientRecordService.findById(id);
        return response;
    }

    @Delete('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deletePatientRecord(@Param('id') id: string): Promise<void> {
        await this.patientRecordService.delete(id);
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async postPatientRecord(
        @Body() body: InsertPatientRecordRequestDto,
    ): Promise<{ id: string }> {
        const response =
            await this.patientRecordService.insertPatientRecord(body);

        return response;
    }

    @Put('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updatePatientRecord(
        @Param('id') id: string,
        @Body() body: UpdatePatientRecordRequestDto,
    ): Promise<void> {
        await this.patientRecordService.update({ ...body, id });
    }

    @Get()
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListPatientRecordsResponseDto,
    })
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listPatientRecords(
        @Query('doctorId') doctorId: string,
        @Query('patientId') patientId: string,
    ): Promise<ListPatientRecordsResponseDto> {
        const response = await this.patientRecordService.findAll({
            doctorId,
            patientId,
        });
        return response;
    }

    @Patch('/:id/generate-summary')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async generateSummary(
        @Param('id') id: string,
    ): Promise<{ newSummary: string }> {
        return await this.patientRecordService.generateSummary(id);
    }
}
