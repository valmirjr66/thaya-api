import { ApiProperty } from '@nestjs/swagger';

export default class GetOrganizationByIdResponseDto {
    @ApiProperty()
    public id: string;

    @ApiProperty()
    public name: string;

    @ApiProperty({ type: [String] })
    public collaborators: string[];

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public address: string;

    @ApiProperty()
    public timezoneOffset: number;
}
