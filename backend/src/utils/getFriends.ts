import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.RDS_URL });

export async function getFriends(userId: string): Promise<string[]> {
  const res = await pool.query('SELECT friend_id FROM friendships WHERE user_id = $1', [userId]);
  return res.rows.map(row => row.friend_id);
}