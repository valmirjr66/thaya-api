import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserChatOrigin } from 'src/types/gpt';
import AssistantService from './AssistantService';
import SendMessageRequestPayload from './events/payloads/SendMessageRequestPayload';
import SendMessageRequestModel from './model/SendMessageRequestModel';
import { FileMetadata } from './schemas/FileMetadataSchema';

@WebSocketGateway({ cors: true })
export class AssistantGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly assistantService: AssistantService) {}

    @WebSocketServer() server: Server;
    private readonly logger: Logger = new Logger('AssistantGateway');

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: SendMessageRequestPayload): void {
        this.logger.log(`Handling message from client: ${client.id}`);

        const messageModel = new SendMessageRequestModel(
            client.handshake.headers['x-user-email'] as string,
            client.handshake.headers['x-user-chat-origin'] as UserChatOrigin,
            payload.content,
        );

        const streamingCallback = (
            userEmail: string,
            textSnapshot: string,
            decoratedAnnotations?: FileMetadata[],
            finished?: boolean,
        ) => {
            this.server.emit('message', {
                userEmail,
                textSnapshot,
                decoratedAnnotations,
                finished,
            });
        };

        this.assistantService.sendMessage(messageModel, streamingCallback);
    }

    afterInit() {
        this.logger.log('Init');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
