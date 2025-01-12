import { NextResponse } from 'next/server';
import { markAsRead } from '../../feeds/email';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    await markAsRead(uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '标记已读失败' },
      { status: 500 }
    );
  }
} 