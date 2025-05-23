"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const web_push_1 = __importDefault(require("web-push"));
const pg_1 = require("pg");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Load environment variables from .env file
// Set up Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Set up PostgreSQL connection
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
// Initialize Web Push
web_push_1.default.setVapidDetails('mailto:zedlinkus@gmail.com', // Replace with your email
process.env.VAPID_PUBLIC_KEY || '', process.env.VAPID_PRIVATE_KEY || '');
// Storage for push subscriptions
const storage = {
    async saveSubscription(subscription) {
        try {
            const client = await pool.connect();
            await client.query('INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES ($1, $2, $3) ON CONFLICT (endpoint) DO NOTHING', [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]);
            client.release();
            return true;
        }
        catch (err) {
            console.error('Error saving subscription:', err);
            return false;
        }
    },
    async deleteSubscription(endpoint) {
        try {
            const client = await pool.connect();
            await client.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
            client.release();
            return true;
        }
        catch (err) {
            console.error('Error deleting subscription:', err);
            return false;
        }
    },
    async getAllSubscriptions() {
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT endpoint, p256dh, auth FROM push_subscriptions');
            client.release();
            return result.rows.map(row => ({
                endpoint: row.endpoint,
                keys: {
                    p256dh: row.p256dh,
                    auth: row.auth
                }
            }));
        }
        catch (err) {
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
        }
        else {
            res.status(500).json({ error: 'Failed to save subscription' });
        }
    }
    catch (err) {
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
        }
        else {
            res.status(500).json({ error: 'Failed to remove subscription' });
        }
    }
    catch (err) {
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
                await web_push_1.default.sendNotification(subscription, payload);
            }
            catch (err) {
                console.error('Error sending notification:', err);
                if (err.statusCode === 410) {
                    await storage.deleteSubscription(subscription.endpoint);
                }
            }
        }
        res.status(200).json({ message: 'Notifications sent' });
    }
    catch (err) {
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
                await web_push_1.default.sendNotification(subscription, payload);
            }
            catch (err) {
                console.error('Error sending notification:', err);
                if (err.statusCode === 410) {
                    await storage.deleteSubscription(subscription.endpoint);
                }
            }
        }
        return res.status(200).json({ message: 'Market opening notifications sent' });
    }
    catch (err) {
        console.error('Market notify error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Create and export the Cloud Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map