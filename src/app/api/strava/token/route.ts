'use server';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } from '@/lib/strava/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, refreshToken } = body;

    let stravaRequestData;

    if (code) {
      stravaRequestData = {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      };
    } else if (refreshToken) {
      stravaRequestData = {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };
    } else {
        return NextResponse.json({ error: 'Authorization code or refresh token is missing' }, { status: 400 });
    }

    const response = await axios.post('https://www.strava.com/oauth/token', stravaRequestData);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Strava Token API Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to process Strava token request', details: error.response?.data }, { status: 500 });
  }
}
