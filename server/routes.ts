import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import webpush from 'web-push';
import { PushSubscription } from '../shared/schema';

// Generate VAPID keys for web push
// These should be set in environment variables in production
const VAPID_PUBLIC_KEY = 'BLV5Gh2S9oi-7EywQ1Rm6tJ7N0GzElb4NbCNQ_JbJKJKECQ9Zsu-0ZCQt_YZGYt4IHGJ9wvpTN3xiTvCyRCpbDQ';
const VAPID_PRIVATE_KEY = 'EjDdgOXocyVInnpn3mHMWaG_X27bDM4j5ZtJcVxnAUk';

// Create a type for the web-push module
declare module 'web-push' {
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;
  
  export function sendNotification(
    subscription: any,
    payload: string | Buffer,
    options?: any
  ): Promise<any>;
}

// Configure web push
webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api

  // Subscribe to push notifications
  app.post('/api/subscribe', async (req: Request, res: Response) => {
    try {
      const subscription = req.body;
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Subscription information missing' });
      }

      const saved = await storage.saveSubscription(subscription);
      if (saved) {
        return res.status(201).json({ success: true });
      } else {
        return res.status(500).json({ error: 'Failed to save subscription' });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Unsubscribe from push notifications
  app.post('/api/unsubscribe', async (req: Request, res: Response) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is required' });
      }

      const deleted = await storage.deleteSubscription(endpoint);
      if (deleted) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ error: 'Failed to delete subscription' });
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send notifications to all subscribers (for testing)
  app.post('/api/notify', async (req: Request, res: Response) => {
    try {
      const { title, body, marketId } = req.body;
      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
      }

      const subscriptions = await storage.getAllSubscriptions();
      if (subscriptions.length === 0) {
        return res.status(404).json({ error: 'No subscriptions found' });
      }

      const notificationPayload = JSON.stringify({
        title,
        body,
        url: marketId ? `/?market=${marketId}` : '/',
        marketId
      });

      const results = await Promise.allSettled(
        subscriptions.map((subscription: any) => 
          webpush.sendNotification(subscription, notificationPayload)
        )
      );

      const succeeded = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled').length;
      const failed = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected').length;

      return res.status(200).json({
        success: true,
        sent: succeeded,
        failed,
        total: subscriptions.length
      });
    } catch (error) {
      console.error('Notification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Notify about market opening
  app.post('/api/notify/market-opening', async (req: Request, res: Response) => {
    try {
      const { marketId, marketName } = req.body;
      if (!marketId || !marketName) {
        return res.status(400).json({ error: 'Market ID and name are required' });
      }

      const subscriptions = await storage.getAllSubscriptions();
      if (subscriptions.length === 0) {
        return res.status(404).json({ error: 'No subscriptions found' });
      }

      const notificationPayload = JSON.stringify({
        title: 'Market Opening Soon',
        body: `${marketName} market is opening soon. Get ready to trade!`,
        url: `/?market=${marketId}`,
        marketId
      });

      const results = await Promise.allSettled(
        subscriptions.map((subscription: any) => 
          webpush.sendNotification(subscription, notificationPayload)
        )
      );

      const succeeded = results.filter((r: PromiseSettledResult<any>) => r.status === 'fulfilled').length;
      const failed = results.filter((r: PromiseSettledResult<any>) => r.status === 'rejected').length;

      return res.status(200).json({
        success: true,
        sent: succeeded,
        failed,
        total: subscriptions.length
      });
    } catch (error) {
      console.error('Market notification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
