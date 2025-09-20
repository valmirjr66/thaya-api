import { ApiProperty } from '@nestjs/swagger';

export default class InsertPatientUserRequestDto {
    @ApiProperty({
        type: [String],
        required: true,
        description: 'Array of doctor ObjectIds',
    })
    public doctorsId: string[];

    @ApiProperty({ required: true })
    public fullname: string;

    @ApiProperty({ required: true })
    public email: string;

    @ApiProperty({ required: true })
    public phoneNumber: string;

    @ApiProperty({ required: true })
    public birthdate: string;

    public nickname: string;

    @ApiProperty({ required: true })
    public password: string;
}
