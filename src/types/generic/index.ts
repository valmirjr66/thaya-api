import { ApiProperty } from '@nestjs/swagger';

export default class GenericCollectionResponse<T> {
    @ApiProperty()
    public items: T[];

    constructor(items: T[]) {
        this.items = items;
    }
}
