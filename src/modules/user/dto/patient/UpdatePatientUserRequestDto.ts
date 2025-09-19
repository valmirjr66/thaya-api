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

    constructor(
        doctorsId: string[],
        fullname: string,
        email: string,
        phoneNumber: string,
        birthdate: string,
        nickname: string,
        password: string,
    ) {
        this.doctorsId = doctorsId;
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthdate = birthdate;
        this.nickname = nickname;
        this.password = password;
    }
}
