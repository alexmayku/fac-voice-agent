import { NextResponse } from 'next/server';
import pg from 'pg';
import { auth } from '@clerk/nextjs/server';

export const revalidate = 0;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return new NextResponse('DATABASE_URL not configured', { status: 500 });
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const result = await client.query(
      'SELECT id, mode, summary, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    return NextResponse.json({ sessions: result.rows });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return new NextResponse('Internal server error', { status: 500 });
  } finally {
    await client.end();
  }
}
