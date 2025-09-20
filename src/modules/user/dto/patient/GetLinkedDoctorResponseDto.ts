import { ApiProperty } from '@nestjs/swagger';

export default class GetLinkedDoctorResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    email: string;
}
