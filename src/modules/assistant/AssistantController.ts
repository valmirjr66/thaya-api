import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import AssistantService from './AssistantService';
import GetChatByUserIdResponseDto from './dto/GetChatByUserIdResponseDto';
import SendMessageRequestDto from './dto/SendMessageRequestDto';
import SendMessageResponseDto from './dto/SendMessageResponseDto';

@ApiTags('Assistant')
@Controller('assistant')
export default class AssistantController extends BaseController {
    constructor(private readonly assistantService: AssistantService) {
        super();
    }

    @Get('/chat')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getChat(
        @Headers('userId') userId?: string,
    ): Promise<GetChatByUserIdResponseDto> {
        const response = await this.assistantService.getChatByUserId(userId);
        this.validateGetResponse(response);
        return response;
    }

    @Post('/chat/message')
    @ApiOkResponse({ description: ResponseDescriptions.CREATED })
    @ApiBadRequestResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async sendMessage(
        @Body() dto: SendMessageRequestDto,
        @Headers('userId') userId?: string,
    ): Promise<SendMessageResponseDto> {
        const response = await this.assistantService.sendMessage({
            ...dto,
            userId: userId || 'anonymous',
        });

        this.validateGetResponse(response);

        return response;
    }
}
