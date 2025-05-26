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
import GetChatByUserEmailResponseDto from './dto/GetChatByUserEmailResponseDto';
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
        @Headers('userEmail') userEmail: string,
    ): Promise<GetChatByUserEmailResponseDto> {
        const response =
            await this.assistantService.getChatByUserEmail(userEmail);
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
        @Headers('userEmail') userEmail: string,
    ): Promise<SendMessageResponseDto> {
        const response = await this.assistantService.sendMessage({
            content: dto.content,
            userEmail,
        });

        this.validateGetResponse(response);

        return response;
    }
}
