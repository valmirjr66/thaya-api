import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import { CalendarModule } from './calendar.module';
import { OrganizationModule } from './organization.module';
import { PatientRecordsModule } from './patient-records.module';
import { PrescriptionModule } from './prescription.module';
import { RoutinesModule } from './routines.module';
import { TelegramModule } from './telegram.module';
import { UserModule } from './user.module';

@Module({
    imports: [
        AssistantModule,
        UserModule,
        TelegramModule,
        RoutinesModule,
        CalendarModule,
        OrganizationModule,
        PatientRecordsModule,
        PrescriptionModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
})
export class AppModule {}
