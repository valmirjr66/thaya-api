import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorDto } from './GetOrganizationByIdResponseDto';

export default class InsertOrganizationRequestDto {
    @ApiProperty()
    public name: string;

    @ApiProperty()
    public collaborators: CollaboratorDto[];

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public address: string;

    @ApiProperty()
    public timezoneOffset: number;
}
