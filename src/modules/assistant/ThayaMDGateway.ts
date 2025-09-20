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
import ThayaMDService from './ThayaMDService';
import HandleIncomingMessageRequestPayload from './events/payloads/HandleIncomingMessageRequestPayload';
import HandleIncomingMessageRequestModel from './model/HandleIncomingMessageRequestModel';
import { FileMetadata } from './schemas/FileMetadataSchema';

@WebSocketGateway({ cors: true })
export default class ThayaMDGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly thayaMDService: ThayaMDService) {}

    @WebSocketServer() server: Server;
    private readonly logger: Logger = new Logger('ThayaMDGateway');

    @SubscribeMessage('message')
    handleMessage(
        client: Socket,
        payload: HandleIncomingMessageRequestPayload,
    ): void {
        this.logger.log(`Received 'message' event from client: ${client.id}`);
        this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

        const { userId, content } = payload;

        const messageModel = new HandleIncomingMessageRequestModel(
            userId,
            content,
        );

        this.logger.debug(
            `Constructed HandleIncomingMessageRequestModel: ${JSON.stringify(messageModel)}`,
        );

        const streamingCallback = (
            userId: string,
            textSnapshot: string,
            decoratedAnnotations?: FileMetadata[],
            finished?: boolean,
        ) => {
            this.logger.log(
                `Streaming callback for user: ${userId}, finished: ${finished ?? false}`,
            );
            this.logger.debug(
                `Text snapshot: ${textSnapshot}, Annotations: ${JSON.stringify(decoratedAnnotations)}`,
            );
            this.server.emit('message', {
                userId,
                textSnapshot,
                decoratedAnnotations,
                finished,
            });
        };

        this.logger.log('Calling assistantService.handleIncomingMessage...');
        this.thayaMDService.handleIncomingMessage(
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
