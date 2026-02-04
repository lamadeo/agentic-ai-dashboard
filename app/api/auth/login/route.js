import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get the hashed password from environment variable
    // Falls back to hardcoded hash due to Next.js env var parsing issues with $ characters
    // A valid bcrypt hash is exactly 60 characters
    const envHash = process.env.TEMP_PWD_HASH?.trim();
    const isValidHash = envHash && envHash.length === 60 && envHash.startsWith('$2b$');
    const hashedPassword = isValidHash
      ? envHash
      : '$2b$10$MJJ76zbXdBiuhrsHzaFMquGfiLJbPWslAK0/P3Bbs0QNCTxvKKR.G';

    console.log('Using', isValidHash ? 'env var hash' : 'fallback hash');
    console.log('Hash length:', hashedPassword?.length);
    if (!isValidHash && envHash) {
      console.log('WARNING: Invalid hash from env (length:', envHash.length, ') - using fallback');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create response with success
    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    // Set httpOnly cookie for session (expires in 8 hours)
    response.cookies.set('auth-session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}
