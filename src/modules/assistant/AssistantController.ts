import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS, USER_CHAT_ORIGINS } from 'src/constants';
import BaseController from '../../BaseController';
import { UserChatOrigin } from '../../types/gpt';
import AssistantService from './AssistantService';
import GetChatByUserIdResponseDto from './dto/GetChatByUserIdResponseDto';
import HandleIncomingMessageRequestDto from './dto/HandleIncomingMessageRequestDto';
import HandleIncomingMessageResponseDto from './dto/HandleIncomingMessageResponseDto';

@ApiTags('Assistant')
@Controller('assistant')
export default class AssistantController extends BaseController {
    constructor(private readonly assistantService: AssistantService) {
        super();
    }

    @Get('/chat')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetChatByUserIdResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getChat(
        @Query('userId') userId: string,
    ): Promise<GetChatByUserIdResponseDto> {
        const response = await this.assistantService.getChatByUserId(userId);
        this.validateGetResponse(response);
        return response;
    }

    @Post('/chat/message')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.CREATED,
        type: HandleIncomingMessageResponseDto,
    })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async handleIncomingMessage(
        @Body() dto: HandleIncomingMessageRequestDto,
        @Headers('x-user-chat-origin') userChatOrigin: string,
    ): Promise<HandleIncomingMessageResponseDto> {
        if (!USER_CHAT_ORIGINS.includes(userChatOrigin as UserChatOrigin)) {
            throw new BadRequestException('Invalid chat origin');
        }

        const response = await this.assistantService.handleIncomingMessage({
            content: dto.content,
            userChatOrigin: userChatOrigin as UserChatOrigin,
            userId: dto.content,
        });

        this.validateGetResponse(response);

        return response;
    }
}
