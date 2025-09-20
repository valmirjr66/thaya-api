import { ApiProperty } from '@nestjs/swagger';
import { CollaboratorRole } from 'src/types/user';

class CollaboratorDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public role: CollaboratorRole;
}

export default class GetOrganizationByIdResponseDto {
    @ApiProperty()
    public id: string;

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
