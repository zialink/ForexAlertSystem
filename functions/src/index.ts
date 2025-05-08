import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import webPush from 'web-push';
import { Pool } from 'pg';

// Set up Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Set up PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Web Push
webPush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  process.env.VAPID_PUBLIC_KEY || '', 
  process.env.VAPID_PRIVATE_KEY || ''
);

// Storage for push subscriptions
const storage = {
  async saveSubscription(subscription: any): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query(
        'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES ($1, $2, $3) ON CONFLICT (endpoint) DO NOTHING',
        [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
      );
      client.release();
      return true;
    } catch (err) {
      console.error('Error saving subscription:', err);
      return false;
    }
  },

  async deleteSubscription(endpoint: string): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
      client.release();
      return true;
    } catch (err) {
      console.error('Error deleting subscription:', err);
      return false;
    }
  },

  async getAllSubscriptions(): Promise<any[]> {
    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT endpoint, p256dh, auth FROM push_subscriptions'
      );
      client.release();
      
      return result.rows.map(row => ({
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth
        }
      }));
    } catch (err) {
      console.error('Error getting subscriptions:', err);
      return [];
    }
  }
};

// API Routes
app.post('/api/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    const success = await storage.saveSubscription(subscription);
    
    if (success) {
      res.status(201).json({ message: 'Subscription added successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    const success = await storage.deleteSubscription(endpoint);
    
    if (success) {
      res.status(200).json({ message: 'Subscription removed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to remove subscription' });
    }
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notify', async (req, res) => {
  try {
    const { title, body, icon, tag } = req.body;
    const payload = JSON.stringify({ title, body, icon, tag });
    const subscriptions = await storage.getAllSubscriptions();
    
    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, payload);
      } catch (err) {
        console.error('Error sending notification:', err);
        if ((err as any).statusCode === 410) {
          await storage.deleteSubscription(subscription.endpoint);
        }
      }
    }
    
    res.status(200).json({ message: 'Notifications sent' });
  } catch (err) {
    console.error('Notify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/notify/market-opening', async (req, res) => {
  try {
    const { market } = req.body;
    if (!market || !market.name) {
      return res.status(400).json({ error: 'Invalid market data' });
    }

    const payload = JSON.stringify({
      title: `${market.name} Market Now Open`,
      body: `The ${market.name} forex market is now open for trading.`,
      icon: '/favicon.ico',
      tag: `market-open-${market.id}`
    });

    const subscriptions = await storage.getAllSubscriptions();

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(subscription, payload);
      } catch (err) {
        console.error('Error sending notification:', err);
        if ((err as any).statusCode === 410) {
          await storage.deleteSubscription(subscription.endpoint);
        }
      }
    }

    return res.status(200).json({ message: 'Market opening notifications sent' });
  } catch (err) {
    console.error('Market notify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create and export the Cloud Function
export const api = functions.https.onRequest(app);