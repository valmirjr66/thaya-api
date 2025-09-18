import { Injectable, Logger } from '@nestjs/common';
import DoctorUserService from 'src/modules/user/DoctorUserService';
import GetDoctorUserInfoResponseModel from 'src/modules/user/model/doctor/GetDoctorUserInfoResponseModel';
import GetPatientInfoResponseModel from 'src/modules/user/model/patient/GetPatientUserInfoResponseModel';
import PatientUserService from 'src/modules/user/PatientUserService';
import { UserChatOrigin } from 'src/types/gpt';

@Injectable()
export default class UserInfoTool {
    private readonly logger: Logger = new Logger('UserInfoTool');

    constructor(
        private readonly doctorUserService: DoctorUserService,
        private readonly patientUserService: PatientUserService,
    ) {}

    async getUserInfo(
        userChatOrigin: UserChatOrigin,
        userId: string,
    ): Promise<GetDoctorUserInfoResponseModel | GetPatientInfoResponseModel> {
        this.logger.log(`Fetching user info for id: ${userId}`);

        try {
            const data =
                userChatOrigin === 'ui'
                    ? await this.doctorUserService.getUserInfoById(userId)
                    : await this.patientUserService.getUserInfoById(userId);

            this.logger.debug(`Received data: ${JSON.stringify(data)}`);

            return data;
        } catch (error) {
            this.logger.error(
                `Error fetching user info for id: ${userId}`,
                error.stack || error.message,
            );
            throw error;
        }
    }
}
