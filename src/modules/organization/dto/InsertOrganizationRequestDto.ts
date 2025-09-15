import { ApiProperty } from '@nestjs/swagger';

export default class InsertOrganizationRequestDto {
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
        name: string,
        collaborators: string[],
        phoneNumber: string,
        address: string,
        timezoneOffset: number,
    ) {
        this.name = name;
        this.collaborators = collaborators;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.timezoneOffset = timezoneOffset;
    }
}
