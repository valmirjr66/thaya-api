import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const DEFAULT_USER_EMAIL = 'valmirgmj@gmail.com';

async function resetMongoDB() {
    const client = new MongoClient(DATABASE_URL);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const collections = await db.collections();

        for (const collection of collections) {
            const result = await collection.deleteMany({});

            console.log(
                `Cleared ${collection.collectionName}: ${result.deletedCount} documents removed.`,
            );
        }

        await db.collection('credentials').insertOne({
            email: DEFAULT_USER_EMAIL,
            password: '123',
        });

        await db.collection('users').insertOne({
            fullname: 'Valmir G. Martins Júnior',
            email: DEFAULT_USER_EMAIL,
            birthdate: '2000-04-13',
            nickname: 'Val',
        });

        await db.collection('calendars').insertMany([
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-01-10'),
                    description: 'Consulta médica anual',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-01-18'),
                    description: 'Reunião de planejamento estratégico',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-01-27'),
                    description: 'Workshop de integração',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-02-08'),
                    description: 'Revisão de contratos',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-02-21'),
                    description: 'Consulta com nutricionista',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-03-03'),
                    description: 'Viagem a trabalho para Campinas',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-03-10'),
                    description: 'Consulta com dermatologista',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-03-15'),
                    description: 'Palestra sobre liderança',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-03-22'),
                    description: 'Mentoria com equipe júnior',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-03-30'),
                    description: 'Entrega de relatório trimestral',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-04-05'),
                    description: 'Consulta odontológica',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-04-11'),
                    description: 'Reunião com fornecedores',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-04-18'),
                    description: 'Revisão de metas trimestrais',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-04-29'),
                    description: 'Feedback com gestores',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-05-02'),
                    description: 'Consulta com psicólogo',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-05-09'),
                    description: 'Planejamento de campanha de marketing',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-05-14'),
                    description: 'Análise de desempenho semestral',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-05-19'),
                    description: 'Reunião com investidores',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-05-23'),
                    description: 'Oficina de inovação',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-05-30'),
                    description: 'Entrega de metas revisadas',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-06-02'),
                    description: 'Consulta no neurologista',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-06-02'),
                    description: 'Reunião com a diretoria da empresa',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-06-15'),
                    description: 'Sessão de coaching',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-06-26'),
                    description: 'Revisão de pipeline de vendas',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-07-06'),
                    description: 'Consulta com clínico geral',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-07-12'),
                    description: 'Reunião de alinhamento com o time',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-07-25'),
                    description: 'Feedback de meio de ano',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-08-01'),
                    description: 'Consulta com fisioterapeuta',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-08-08'),
                    description: 'Planejamento de inovação',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-08-15'),
                    description: 'Análise de dados financeiros',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-08-22'),
                    description: 'Reunião sobre cultura organizacional',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-08-29'),
                    description: 'Visita técnica a fornecedor',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-10-04'),
                    description: 'Consulta com nutricionista',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-10-11'),
                    description: 'Avaliação de saúde mental',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-10-18'),
                    description: 'Apresentação de resultados',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-10-30'),
                    description: 'Planejamento de 2026',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-11-03'),
                    description: 'Auditoria de processos',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-11-07'),
                    description: 'Participação em conferência',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-11-12'),
                    description: 'Consulta com cardiologista',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-11-18'),
                    description: 'Análise de indicadores',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-11-24'),
                    description: 'Avaliação da equipe técnica',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-11-30'),
                    description: 'Planejamento de reestruturação',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-12-05'),
                    description: 'Consulta oftalmológica',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-12-15'),
                    description: 'Reunião de encerramento do ano',
                },
            },
            {
                userEmail: DEFAULT_USER_EMAIL,
                record: {
                    datetime: new Date('2025-12-20'),
                    description: 'Festa de confraternização da empresa',
                },
            },
        ]);

        console.log('All collections cleared successfully.');
    } catch (error) {
        console.error('Error clearing collections:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

resetMongoDB();
