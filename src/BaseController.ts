import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export default class BaseController {
    protected validateGetResponse<T>(response: T): void {
        if (
            Object.prototype.hasOwnProperty.call(response, 'items') &&
            response['items'] === 0
        ) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        } else if (!response) {
            throw new NotFoundException();
        }
    }
}
