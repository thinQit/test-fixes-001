import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const detail = searchParams.get('detail') === 'true';
    const payload: { status: string; uptimeSeconds: number; version?: string } = {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime())
    };

    if (detail) {
      payload.version = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
    }

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
