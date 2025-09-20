import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorDto } from './GetOrganizationByIdResponseDto';

export default class InsertOrganizationRequestDto {
    @ApiProperty({ required: true })
    public name: string;

    @ApiProperty({ required: true })
    public collaborators: CollaboratorDto[];

    @ApiProperty({ required: true })
    public phoneNumber: string;

    @ApiProperty({ required: true })
    public address: string;

    @ApiProperty({ required: true })
    public timezoneOffset: number;
}
