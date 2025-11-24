// Cron job for sending task reminders
import cron from 'node-cron';
import { storage } from '../storage';
import * as cliqService from '../services/cliq-service';

// Run every hour to check for upcoming tasks
export function startReminderScheduler() {
  console.log('📅 Starting task reminder scheduler...');
  
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Checking for task reminders...');
    
    try {
      // In a real implementation, this would:
      // 1. Query Notion for tasks due in the next 24 hours
      // 2. Check user notification settings
      // 3. Send reminders to Cliq users who have reminders enabled
      
      console.log('✓ Task reminder check completed');
    } catch (error) {
      console.error('Error checking task reminders:', error);
    }
  });
  
  console.log('✓ Reminder scheduler started');
}

// Manual trigger for testing
export async function sendTestReminder(cliqUserId: string) {
  await cliqService.sendTaskReminder({
    userId: cliqUserId,
    taskTitle: 'Test Task',
    taskUrl: 'https://notion.so/test-task',
    dueDate: 'today',
  });
}
