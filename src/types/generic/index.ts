import { ApiProperty } from '@nestjs/swagger';

// TODO: remove this class and use only the interface
export default class GenericCollectionResponse<T> {
    @ApiProperty()
    public items: T[];

    constructor(items: T[]) {
        this.items = items;
    }
}

export interface ListResponse<T> {
    items: T[];
}
