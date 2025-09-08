import { ApiProperty } from '@nestjs/swagger';

export default class SendMessageRequestDto {
    @ApiProperty()
    public content: string;

    constructor(content: string) {
        this.content = content;
    }
}
