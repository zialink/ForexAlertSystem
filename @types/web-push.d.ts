declare module 'web-push' {
  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  export interface WebPushOptions {
    gcmAPIKey?: string;
    vapidDetails?: {
      subject: string;
      publicKey: string;
      privateKey: string;
    };
    TTL?: number;
    headers?: Record<string, string>;
    contentEncoding?: string;
    proxy?: string;
  }

  export function generateVAPIDKeys(): VapidKeys;
  
  export function setGCMAPIKey(apiKey: string): void;
  
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;
  
  export function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer,
    options?: WebPushOptions
  ): Promise<{ statusCode: number; body: string; headers: Record<string, string> }>;
}