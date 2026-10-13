import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'corporate_manager',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 200) {
      console.log(`Executed query in ${duration}ms:`, { text });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
};

export const checkDatabaseHealth = async (): Promise<{ status: boolean; latency: number; details?: any }> => {
  const start = Date.now();
  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as version;');
    const latency = Date.now() - start;
    return {
      status: true,
      latency,
      details: {
        time: res.rows[0].current_time,
        version: res.rows[0].version,
      },
    };
  } catch (error: any) {
    return {
      status: false,
      latency: -1,
      details: error.message,
    };
  }
};
