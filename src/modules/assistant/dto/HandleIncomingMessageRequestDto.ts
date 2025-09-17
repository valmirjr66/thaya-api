import { ApiProperty } from '@nestjs/swagger';

export default class HandleIncomingMessageRequestDto {
    @ApiProperty()
    public userId: string;

    @ApiProperty()
    public content: string;

    constructor(content: string) {
        this.content = content;
    }
}
