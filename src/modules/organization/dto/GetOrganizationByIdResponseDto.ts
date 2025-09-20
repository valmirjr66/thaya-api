import { ApiProperty } from '@nestjs/swagger';
import { COLLABORATOR_ROLES } from 'src/constants';
import { CollaboratorRole } from 'src/types/user';

export class CollaboratorDto {
    @ApiProperty()
    public id: string;

    @ApiProperty({ enum: COLLABORATOR_ROLES })
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
