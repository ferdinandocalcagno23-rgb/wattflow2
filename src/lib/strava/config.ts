export const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
export const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !APP_URL) {
    // In a real app, you might want to handle this more gracefully
    // But for development, throwing an error is clear.
    console.warn("Strava environment variables are not fully set. Please check your .env file. Some features may not work.");
}
