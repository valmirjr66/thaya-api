export const DEFAULT_ADMIN_EMAIL = 'thaya.admin@gmail.com';
export const DEFAULT_1_PATIENT_EMAIL = 'thaya.patient1@gmail.com';
export const DEFAULT_2_PATIENT_EMAIL = 'thaya.patient2@gmail.com';
export const DEFAULT_1_DOCTOR_EMAIL = 'thaya.doctor1@gmail.com';
export const DEFAULT_2_DOCTOR_EMAIL = 'thaya.doctor2@gmail.com';
export const DEFAULT_SUPPORT_EMAIL = 'thaya.support@gmail.com';

export const DEFAULT_TELEGRAM_ID = 761249989;
export const DEFAULT_PASSWORD = '123';

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

export const PATIENT_RECORD = {
    summary:
        'Paciente vem clamando insônia e dor de cabeça há algum tempo, investigação no efeito colateral do anti-depressivo',
    content: `
descartado: efeitos colaterais da sertralina

04/10/24 =====

Paciente relata sono irregular, acordando várias vezes à noite. Peso estável. Solicito exame de litemia para monitoramento terapêutico.

03/11/24 =====

Queixas persistentes de dor de cabeça. Peso discretamente aumentado. Resultado de litemia dentro da faixa terapêutica.

10/12/24 =====

Melhora parcial do quadro de insônia após ajustes de rotina. Peso segue em leve elevação. Nova coleta de lítio solicitada para acompanhamento.

15/01/25 =====

Paciente relata maior disposição. Peso estabilizado. Exame confirma lítio ainda em faixa terapêutica, sem sinais de toxicidade.
  `,
    series: [
        {
            title: 'Peso',
            type: 'weight',
            records: [
                { datetime: '2024-12-10', value: 71.8 },
                { datetime: '2025-01-15', value: 71.9 },
                { datetime: '2024-10-04', value: 70.5 },
                { datetime: '2024-11-03', value: 71.2 },
                { datetime: '2024-12-10', value: 71.8 },
            ],
        },
        {
            title: 'Litemia (mmol/L)',
            type: 'custom',
            records: [
                { datetime: '2024-10-04', value: 0.6 },
                { datetime: '2024-11-03', value: 0.8 },
                { datetime: '2024-12-10', value: 0.7 },
                { datetime: '2025-01-15', value: 0.9 },
                { datetime: '2024-10-04', value: 0.6 },
                { datetime: '2024-11-03', value: 0.8 },
                { datetime: '2024-12-10', value: 0.7 },
                { datetime: '2025-01-15', value: 0.9 },
            ],
        },
    ],
};
