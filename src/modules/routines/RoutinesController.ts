import { Controller, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import BaseController from '../../BaseController';
import RoutinesService from './RoutinesService';

@ApiTags('Routine')
@Controller('routines')
export default class RoutinesController extends BaseController {
    constructor(private readonly routinesService: RoutinesService) {
        super();
    }

    @Post('trigger-patient-reminder')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async triggerPatientReminder(): Promise<void> {
        await this.routinesService.triggerPatientReminder();
    }
}
