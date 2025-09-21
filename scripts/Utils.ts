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

export const PATIENT_RECORD_1 = {
    summary:
        'Paciente apresenta histórico de insônia, dor de cabeça e variações de peso. Investigação de efeitos colaterais do anti-depressivo e acompanhamento de litemia.',
    content: `
## Histórico Clínico

- **Diagnóstico principal:** Insônia e cefaleia recorrente
- **Medicação em uso:** Sertralina, Lítio
- **Acompanhamento:** Monitoramento de litemia e peso

---

### Evolução

**Descartado:** efeitos colaterais da sertralina

---

#### 04/10/24

- Paciente relata sono irregular, acordando várias vezes à noite.
- Peso estável.
- Solicito exame de litemia para monitoramento terapêutico.

---

#### 03/11/24

- Queixas persistentes de dor de cabeça.
- Peso discretamente aumentado.
- Resultado de litemia dentro da faixa terapêutica.

---

#### 10/12/24

- Melhora parcial do quadro de insônia após ajustes de rotina.
- Peso segue em leve elevação.
- Nova coleta de lítio solicitada para acompanhamento.

---

#### 15/01/25

- Paciente relata maior disposição.
- Peso estabilizado.
- Exame confirma lítio ainda em faixa terapêutica, sem sinais de toxicidade.

---

#### 20/02/25

- Sono regularizado, sem despertares noturnos.
- Peso manteve-se estável.
- Litemia dentro dos parâmetros, sem alterações clínicas.

---

#### 25/03/25

- Sem queixas de dor de cabeça nas últimas semanas.
- Peso apresenta leve redução.
- Litemia permanece estável.

---

## Observações Adicionais

- **Exames laboratoriais:** Hemograma, função renal e tireoidiana normais.
- **Orientações:** Manter rotina de sono, acompanhamento nutricional e reavaliação psiquiátrica mensal.
  `,
    series: [
        {
            title: 'Peso',
            type: 'weight',
            records: [
                { datetime: '2024-10-04', value: 70.5 },
                { datetime: '2024-11-03', value: 71.2 },
                { datetime: '2024-12-10', value: 71.8 },
                { datetime: '2025-01-15', value: 71.9 },
                { datetime: '2025-02-20', value: 71.9 },
                { datetime: '2025-03-25', value: 71.2 },
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
                { datetime: '2025-02-20', value: 0.8 },
                { datetime: '2025-03-25', value: 0.7 },
            ],
        },
        {
            title: 'Pressão Arterial (mmHg)',
            type: 'blood-pressure-systolic',
            records: [
                { datetime: '2024-10-04', value: 120 },
                { datetime: '2024-12-10', value: 122 },
                { datetime: '2025-01-15', value: 118 },
                { datetime: '2025-03-25', value: 119 },
            ],
        },
        {
            title: 'Pressão Arterial (mmHg)',
            type: 'blood-pressure-diastolic',
            records: [
                { datetime: '2024-10-04', value: 80 },
                { datetime: '2024-12-10', value: 82 },
                { datetime: '2025-01-15', value: 78 },
                { datetime: '2025-03-25', value: 79 },
            ],
        },
        {
            title: 'Qualidade do Sono (escala 1-10)',
            type: 'custom',
            records: [
                { datetime: '2024-10-04', value: 4 },
                { datetime: '2024-12-10', value: 6 },
                { datetime: '2025-01-15', value: 7 },
                { datetime: '2025-02-20', value: 8 },
                { datetime: '2025-03-25', value: 9 },
            ],
        },
    ],
};

export const PATIENT_RECORD_2 = {
    summary:
        'Paciente apresenta histórico de asma, alergias sazonais e episódios de bronquite. Monitoramento de função pulmonar e ajuste de medicação broncodilatadora.',
    content: `
## Histórico Clínico

- **Diagnóstico principal:** Asma persistente e rinite alérgica
- **Medicação em uso:** Salbutamol, Budesonida inalatório
- **Acompanhamento:** Espirometria periódica e controle ambiental

---

### Evolução

**Descartado:** infecção bacteriana aguda

---

#### 10/09/24

- Paciente relata tosse seca e chiado no peito, principalmente à noite.
- Uso de salbutamol aumentou para 2x/dia.
- Espirometria mostra leve redução do VEF1.

---

#### 15/10/24

- Episódio de bronquite tratado com antibiótico.
- Sintomas respiratórios controlados após ajuste de budesonida.
- VEF1 retorna ao valor basal.

---

#### 20/11/24

- Queixas de congestão nasal e espirros frequentes.
- Iniciado anti-histamínico.
- Sem alterações significativas na função pulmonar.

---

#### 05/01/25

- Sem crises de asma nas últimas semanas.
- Redução gradual do uso de salbutamol.
- Espirometria dentro da faixa esperada.

---

#### 18/02/25

- Paciente relata melhora significativa dos sintomas alérgicos.
- Mantido acompanhamento mensal.
- VEF1 estável.

---

#### 30/03/25

- Sem sintomas respiratórios ou alérgicos.
- Medicação mantida em dose mínima eficaz.
- Orientado a manter controle ambiental.

---

## Observações Adicionais

- **Exames laboratoriais:** Hemograma e IgE total elevados, função hepática normal.
- **Orientações:** Evitar exposição a alérgenos, manter uso regular de inalatório e reavaliação pneumológica trimestral.
  `,
    series: [
        {
            title: 'VEF1 (L)',
            type: 'custom',
            records: [
                { datetime: '2024-09-10', value: 2.1 },
                { datetime: '2024-10-15', value: 1.8 },
                { datetime: '2024-11-20', value: 2.0 },
                { datetime: '2025-01-05', value: 2.2 },
                { datetime: '2025-02-18', value: 2.3 },
                { datetime: '2025-03-30', value: 2.3 },
            ],
        },
        {
            title: 'Crises de Asma (nº/mês)',
            type: 'custom',
            records: [
                { datetime: '2024-09-10', value: 3 },
                { datetime: '2024-10-15', value: 2 },
                { datetime: '2024-11-20', value: 2 },
                { datetime: '2025-01-05', value: 1 },
                { datetime: '2025-02-18', value: 0 },
                { datetime: '2025-03-30', value: 0 },
            ],
        },
        {
            title: 'Uso de Salbutamol (doses/dia)',
            type: 'custom',
            records: [
                { datetime: '2024-09-10', value: 2 },
                { datetime: '2024-10-15', value: 3 },
                { datetime: '2024-11-20', value: 2 },
                { datetime: '2025-01-05', value: 1 },
                { datetime: '2025-02-18', value: 1 },
                { datetime: '2025-03-30', value: 1 },
            ],
        },
        {
            title: 'Sintomas Alérgicos (escala 1-10)',
            type: 'custom',
            records: [
                { datetime: '2024-09-10', value: 7 },
                { datetime: '2024-10-15', value: 6 },
                { datetime: '2024-11-20', value: 8 },
                { datetime: '2025-01-05', value: 5 },
                { datetime: '2025-02-18', value: 3 },
                { datetime: '2025-03-30', value: 2 },
            ],
        },
    ],
};
