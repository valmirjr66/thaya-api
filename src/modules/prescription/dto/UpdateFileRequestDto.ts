import { ApiProperty } from '@nestjs/swagger';

export default class UpdateFileRequestDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File;
}
