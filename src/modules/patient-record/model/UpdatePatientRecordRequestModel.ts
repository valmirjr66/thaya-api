import { Injectable } from '@nestjs/common';

@Injectable()
export default class UpdatePatientRecordRequestModel {
    constructor(
        public id: string,
        public summary: string,
        public content: string,
    ) {}
}
