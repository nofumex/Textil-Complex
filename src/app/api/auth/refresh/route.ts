import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token не найден' },
        { status: 401 }
      );
    }

    // Refresh the access token
    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

    // Set new cookies
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    cookieStore.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    
    // Clear invalid cookies
    const cookieStore = cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json(
      { success: false, error: 'Недействительный refresh token' },
      { status: 401 }
    );
  }
}


