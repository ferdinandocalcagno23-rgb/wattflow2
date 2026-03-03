'use client';
import axios from 'axios';
import { STRAVA_CLIENT_ID, APP_URL } from '@/lib/strava/config';
import type { StravaTokenData } from '@/types';

const STRAVA_TOKEN_KEY = 'strava_token_data';

class StravaService {
  private tokenData: StravaTokenData | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(STRAVA_TOKEN_KEY);
      if (storedToken) {
        try {
            this.tokenData = JSON.parse(storedToken);
        } catch(e) {
            console.error("Failed to parse strava token", e);
            localStorage.removeItem(STRAVA_TOKEN_KEY);
        }
      }
    }
  }

  public getAuthUrl(): string {
    const redirectUri = `${APP_URL}/strava/exchange_token`;
    const scope = 'activity:write,read';
    return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
  }
  
  public isAuthenticated(): boolean {
    return !!this.tokenData?.access_token;
  }

  private saveTokenData(data: StravaTokenData) {
    // Strava returns expiry in seconds from epoch, convert to ms for JS Date compatibility
    const expires_at_ms = data.expires_at * 1000;
    this.tokenData = { ...data, expires_at: expires_at_ms };
    localStorage.setItem(STRAVA_TOKEN_KEY, JSON.stringify(this.tokenData));
  }
  
  public disconnect() {
    this.tokenData = null;
    localStorage.removeItem(STRAVA_TOKEN_KEY);
  }

  async exchangeToken(code: string): Promise<void> {
    const response = await axios.post('/api/strava/token', { code });
    this.saveTokenData(response.data);
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.tokenData) throw new Error("Not authenticated with Strava.");

    // Check if token is expired or about to expire (within 5 minutes)
    if (Date.now() >= this.tokenData.expires_at - 5 * 60 * 1000) {
      console.log("Strava token expired or expiring soon, refreshing...");
      await this.refreshToken();
    }
    
    return this.tokenData!.access_token;
  }
  
  private async refreshToken(): Promise<void> {
    if (!this.tokenData?.refresh_token) {
        this.disconnect(); // Clear invalid token data
        throw new Error("No refresh token available. Please re-authenticate.");
    }
    try {
        const response = await axios.post('/api/strava/token', { 
            refreshToken: this.tokenData.refresh_token
        });
        this.saveTokenData(response.data);
    } catch(e) {
        console.error("Failed to refresh token, disconnecting", e);
        this.disconnect();
        throw e;
    }
  }

  public async uploadActivity(activityBlob: Blob, name: string, dataType: 'fit' | 'tcx' = 'fit'): Promise<any> {
    const accessToken = await this.getValidAccessToken();
    
    const formData = new FormData();
    formData.append('file', activityBlob, `${name.replace(/\s+/g, '_')}.${dataType}`);
    formData.append('data_type', dataType);
    formData.append('name', name);
    
    const response = await axios.post('https://www.strava.com/api/v3/uploads', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

export const stravaService = new StravaService();
