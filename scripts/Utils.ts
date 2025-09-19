export const DEFAULT_ADMIN_EMAIL = 'thaya.admin@gmail.com';
export const DEFAULT_1_PATIENT_EMAIL = 'thaya.patient1@gmail.com';
export const DEFAULT_2_PATIENT_EMAIL = 'thaya.patient2@gmail.com';
export const DEFAULT_1_DOCTOR_EMAIL = 'thaya.doctor1@gmail.com';
export const DEFAULT_2_DOCTOR_EMAIL = 'thaya.doctor2@gmail.com';
export const DEFAULT_SUPPORT_EMAIL = 'thaya.support@gmail.com';

export const DEFAULT_TELEGRAM_ID = 761249989;

export function shiftOccurrenceDateBy_N_Months(
    occurrences: { datetime: Date; description: string }[],
    N_months: number,
) {
    return occurrences.map((occurrence) => {
        const newOccurrence = { ...occurrence };

        newOccurrence.datetime.setDate(
            newOccurrence.datetime.getDate() + 30 * N_months,
        );

        return newOccurrence;
    });
}

export const DOCTOR_1_OCCURRENCES = [
    // September appointments
    {
        datetime: new Date('2025-09-04T08:30:00'),
        description: 'General consultation',
    },
    {
        datetime: new Date('2025-09-12T13:00:00'),
        description: 'Surgery follow-up',
    },
    {
        datetime: new Date('2025-09-18T15:00:00'),
        description: 'Patient review meeting',
    },
    {
        datetime: new Date('2025-09-22T10:00:00'),
        description: 'Medical conference',
    },
    {
        datetime: new Date('2025-09-28T11:30:00'),
        description: 'Prescription renewal',
    },
    // October appointments
    {
        datetime: new Date('2025-10-05T09:00:00'),
        description: 'Dermatology consultation',
    },
    {
        datetime: new Date('2025-10-13T14:30:00'),
        description: 'Cardiology case discussion',
    },
    {
        datetime: new Date('2025-10-19T16:00:00'),
        description: 'Physical therapy supervision',
    },
    {
        datetime: new Date('2025-10-27T12:00:00'),
        description: 'Patient feedback session',
    },
];

// DOCTOR_2_OCCURRENCES: similar structure, different times/descriptions
export const DOCTOR_2_OCCURRENCES = [
    // September appointments
    {
        datetime: new Date('2025-09-06T09:00:00'),
        description: 'Initial patient assessment',
    },
    {
        datetime: new Date('2025-09-13T14:00:00'),
        description: 'Post-operation review',
    },
    {
        datetime: new Date('2025-09-19T16:00:00'),
        description: 'Team meeting',
    },
    {
        datetime: new Date('2025-09-23T11:00:00'),
        description: 'Medical workshop',
    },
    {
        datetime: new Date('2025-09-30T10:30:00'),
        description: 'Medication update',
    },
    // October appointments
    {
        datetime: new Date('2025-10-06T10:00:00'),
        description: 'Skin disorder consultation',
    },
    {
        datetime: new Date('2025-10-14T13:30:00'),
        description: 'Heart case review',
    },
    {
        datetime: new Date('2025-10-20T15:00:00'),
        description: 'Therapy session supervision',
    },
    {
        datetime: new Date('2025-10-28T13:00:00'),
        description: 'Patient evaluation meeting',
    },
];
