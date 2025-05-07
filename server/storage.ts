import { db } from '../db';
import { eq } from 'drizzle-orm';
import { pushSubscriptions } from '../shared/schema';

// Storage interface for push notification subscriptions
export const storage = {
  async saveSubscription(subscription: any): Promise<boolean> {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        subscription: subscription
      };
      
      await db.insert(pushSubscriptions)
        .values(subscriptionData)
        .onConflictDoUpdate({
          target: pushSubscriptions.endpoint,
          set: { subscription: subscription }
        });
      
      return true;
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
  },
  
  async deleteSubscription(endpoint: string): Promise<boolean> {
    try {
      await db.delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));
      
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  },
  
  async getAllSubscriptions(): Promise<any[]> {
    try {
      const subscriptions = await db.select()
        .from(pushSubscriptions);
      
      return subscriptions.map(record => record.subscription);
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }
};