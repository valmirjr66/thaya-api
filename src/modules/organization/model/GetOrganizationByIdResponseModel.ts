import { Collaborator } from 'src/types/user';

export default class GetOrganizationByIdResponseModel {
    constructor(
        public id: string,
        public collaborators: Collaborator[],
        public name: string,
        public address: string,
        public phoneNumber: string,
        public timezoneOffset: number,
    ) {}
}
