import { ApiProperty } from '@nestjs/swagger';
import { Collaborator } from 'src/types/user';

export default class UpdateOrganizationRequestDto {
    @ApiProperty()
    public name: string;

    @ApiProperty()
    public collaborators: Collaborator[];

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public address: string;

    @ApiProperty()
    public timezoneOffset: number;
}
