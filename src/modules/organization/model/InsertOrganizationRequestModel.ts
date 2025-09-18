import { Collaborator } from 'src/types/user';

export default class InsertOrganizationRequestModel {
    constructor(
        public name: string,
        public collaborators: Collaborator[],
        public phoneNumber: string,
        public address: string,
        public timezoneOffset: number,
    ) {}
}
