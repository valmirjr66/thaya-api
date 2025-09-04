import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    Post,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import BaseController from '../../BaseController';
import AssistantService from './AssistantService';
import GetChatByUserEmailResponseDto from './dto/GetChatByUserEmailResponseDto';
import SendMessageRequestDto from './dto/SendMessageRequestDto';
import SendMessageResponseDto from './dto/SendMessageResponseDto';
import { UserChatOrigin } from '../../types/gpt';
import { RESPONSE_DESCRIPTIONS, USER_CHAT_ORIGINS } from 'src/constants';

@ApiTags('Assistant')
@Controller('assistant')
export default class AssistantController extends BaseController {
    constructor(private readonly assistantService: AssistantService) {
        super();
    }

    @Get('/chat')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getChat(
        @Headers('x-user-email') userEmail: string,
    ): Promise<GetChatByUserEmailResponseDto> {
        const response =
            await this.assistantService.getChatByUserEmail(userEmail);
        this.validateGetResponse(response);
        return response;
    }

    @Post('/chat/message')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async sendMessage(
        @Body() dto: SendMessageRequestDto,
        @Headers('x-user-email') userEmail: string,
        @Headers('x-user-chat-origin') userChatOrigin: string,
    ): Promise<SendMessageResponseDto> {
        if (!USER_CHAT_ORIGINS.includes(userChatOrigin as UserChatOrigin)) {
            throw new BadRequestException('Invalid chat origin');
        }

        const response = await this.assistantService.sendMessage({
            content: dto.content,
            userChatOrigin: userChatOrigin as UserChatOrigin,
            userEmail,
        });

        this.validateGetResponse(response);

        return response;
    }
}
