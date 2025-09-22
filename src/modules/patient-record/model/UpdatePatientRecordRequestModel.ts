export default class UpdatePatientRecordRequestModel {
    constructor(
        public id: string,
        public summary: string,
        public content: string,
    ) {}
}
