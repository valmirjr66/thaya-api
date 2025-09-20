import { ApiProperty } from '@nestjs/swagger';

export default class UpdatePatientUserRequestDto {
    @ApiProperty({
        type: [String],
        required: true,
        description: 'Array of doctor ObjectIds',
    })
    public doctorsId: string[];

    @ApiProperty()
    public fullname: string;

    @ApiProperty()
    public email: string;

    @ApiProperty()
    public phoneNumber: string;

    @ApiProperty()
    public birthdate: string;

    @ApiProperty()
    public nickname: string;

    @ApiProperty()
    public password: string;
}
