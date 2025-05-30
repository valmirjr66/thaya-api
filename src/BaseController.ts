import { HttpException, HttpStatus } from '@nestjs/common';
import GenericCollectionResponse from './types/generic';

export default class BaseController {
    protected validateGetResponse<T>(
        response: T | GenericCollectionResponse<T>,
    ): void {
        if (
            response instanceof GenericCollectionResponse &&
            response.items.length === 0
        ) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        } else if (!response) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
    }
}
