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
import HandleIncomingMessageRequestPayload from './events/payloads/HandleIncomingMessageRequestPayload';
import HandleIncomingMessageRequestModel from './model/HandleIncomingMessageRequestModel';
import { FileMetadata } from './schemas/FileMetadataSchema';

@WebSocketGateway({ cors: true })
export class AssistantGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly assistantService: AssistantService) {}

    @WebSocketServer() server: Server;
    private readonly logger: Logger = new Logger('AssistantGateway');

    @SubscribeMessage('message')
    handleMessage(
        client: Socket,
        payload: HandleIncomingMessageRequestPayload,
    ): void {
        this.logger.log(`Received 'message' event from client: ${client.id}`);
        this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

        const userEmail = client.handshake.headers['x-user-email'] as string;
        const userChatOrigin = client.handshake.headers[
            'x-user-chat-origin'
        ] as UserChatOrigin;

        this.logger.log(
            `User email: ${userEmail}, Chat origin: ${userChatOrigin}`,
        );

        const messageModel = new HandleIncomingMessageRequestModel(
            userEmail,
            userChatOrigin,
            payload.content,
        );

        this.logger.debug(
            `Constructed HandleIncomingMessageRequestModel: ${JSON.stringify(messageModel)}`,
        );

        const streamingCallback = (
            userEmail: string,
            textSnapshot: string,
            decoratedAnnotations?: FileMetadata[],
            finished?: boolean,
        ) => {
            this.logger.log(
                `Streaming callback for user: ${userEmail}, finished: ${finished ?? false}`,
            );
            this.logger.debug(
                `Text snapshot: ${textSnapshot}, Annotations: ${JSON.stringify(decoratedAnnotations)}`,
            );
            this.server.emit('message', {
                userEmail,
                textSnapshot,
                decoratedAnnotations,
                finished,
            });
        };

        this.logger.log('Calling assistantService.handleIncomingMessage...');
        this.assistantService.handleIncomingMessage(
            messageModel,
            streamingCallback,
        );
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
