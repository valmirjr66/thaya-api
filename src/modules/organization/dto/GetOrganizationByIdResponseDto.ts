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

    constructor(
        id: string,
        collaborators: string[],
        name: string,
        phoneNumber: string,
        address: string,
        timezoneOffset: number,
    ) {
        this.id = id;
        this.collaborators = collaborators;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.timezoneOffset = timezoneOffset;
    }
}
