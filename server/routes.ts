import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as notionService from "./services/notion-service";
import * as cliqService from "./services/cliq-service";

// Middleware to get or create Cliq user (simulated for demo)
async function getOrCreateCliqUser(req: Request) {
  // In a real implementation, extract Cliq user from request headers/tokens
  // For demo, we'll use a test user ID
  const cliqUserId = req.headers['x-cliq-user-id'] as string || 'demo-user-001';
  const cliqDisplayName = req.headers['x-cliq-display-name'] as string || 'Demo User';
  const cliqEmail = req.headers['x-cliq-email'] as string;

  let user = await storage.getCliqUserByCliqUserId(cliqUserId);
  
  if (!user) {
    try {
      user = await storage.createCliqUser({
        cliqUserId,
        cliqDisplayName,
        cliqEmail,
      });
      
      // Create default notification settings
      await storage.createOrUpdateNotificationSettings({
        cliqUserId: user.id,
        remindersEnabled: true,
        reminderHoursBefore: 24,
        notifyOnTaskAssigned: true,
        notifyOnTaskUpdated: true,
      });
    } catch (error: any) {
      // Handle race condition - user was created by another request
      if (error.code === '23505') { // PostgreSQL unique violation error
        user = await storage.getCliqUserByCliqUserId(cliqUserId);
        if (!user) {
          throw error; // If still not found, throw the original error
        }
      } else {
        throw error;
      }
    }
  }
  
  return user;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==================== Connection Status ====================
  app.get("/api/connection/status", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const userToken = await storage.getNotionToken(user.id);
      
      if (userToken) {
        // User has per-user token
        res.json({
          isConnected: true,
          workspaceName: userToken.workspaceName || 'Your Workspace',
          workspaceIcon: userToken.workspaceIcon,
        });
      } else {
        // Fall back to global connector status
        const globalInfo = await notionService.getGlobalConnectionInfo();
        res.json(globalInfo);
      }
    } catch (error) {
      res.json({ isConnected: false });
    }
  });

  // ==================== Notion OAuth ====================
  app.get("/api/auth/notion/start", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      
      // For this demo, we'll simulate OAuth by using the global Replit connector
      // and storing it as the user's personal token
      const globalInfo = await notionService.getGlobalConnectionInfo();
      
      if (globalInfo.isConnected) {
        // Get the access token from the global connector
        const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
        const xReplitToken = process.env.REPL_IDENTITY 
          ? 'repl ' + process.env.REPL_IDENTITY 
          : process.env.WEB_REPL_RENEWAL 
          ? 'depl ' + process.env.WEB_REPL_RENEWAL 
          : null;

        if (xReplitToken) {
          const connectionSettings = await fetch(
            'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
            {
              headers: {
                'Accept': 'application/json',
                'X_REPLIT_TOKEN': xReplitToken
              }
            }
          ).then(res => res.json()).then(data => data.items?.[0]);

          const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
          
          if (accessToken) {
            // Store the token as the user's personal token
            await storage.createOrUpdateNotionToken({
              cliqUserId: user.id,
              accessToken,
              botId: globalInfo.botId,
              workspaceName: globalInfo.workspaceName,
              workspaceIcon: globalInfo.workspaceIcon,
            });
            
            // Log the connection
            await storage.createActivityLog({
              cliqUserId: user.id,
              activityType: 'connected',
              description: `Connected Notion workspace: ${globalInfo.workspaceName || 'Workspace'}`,
            });
          }
        }
      }
      
      res.send(`
        <html>
          <head>
            <style>
              body {
                font-family: Inter, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .card {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                max-width: 400px;
                text-align: center;
              }
              .success {
                color: #10b981;
                font-size: 48px;
                margin-bottom: 1rem;
              }
              h1 { margin: 0 0 1rem; font-size: 1.5rem; }
              p { color: #666; margin: 0 0 1.5rem; }
              button {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="success">✓</div>
              <h1>Notion Connected!</h1>
              <p>Your Notion workspace is now connected to Zoho Cliq. You can close this window and return to Cliq.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send('Error connecting to Notion');
    }
  });

  app.post("/api/auth/notion/disconnect", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      await storage.deleteNotionToken(user.id);
      
      await storage.createActivityLog({
        cliqUserId: user.id,
        activityType: 'disconnected',
        description: 'Disconnected Notion workspace',
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Widget Data Endpoints ====================
  
  // Get tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const userToken = await storage.getNotionToken(user.id);
      
      if (!userToken) {
        // User hasn't connected Notion yet
        return res.json([]);
      }
      
      // Use per-user token to create Notion client
      const notion = await notionService.getNotionClient(userToken);
      
      // Fetch recent pages and filter/format as tasks
      // In production, this would query a specific tasks database
      const pages = await notionService.getRecentPages(notion);
      
      // Convert recent pages to task format for demo
      const tasks = pages.slice(0, 5).map((page, idx) => ({
        id: page.id,
        title: page.title,
        status: idx % 3 === 0 ? "In Progress" : idx % 3 === 1 ? "To Do" : "Done",
        dueDate: idx < 3 ? new Date(Date.now() + (idx + 1) * 86400000).toISOString() : undefined,
        assignee: idx % 2 === 0 ? user.cliqDisplayName : undefined,
        url: page.url,
        properties: {},
      }));
      
      res.json(tasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update task status
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const { id } = req.params;
      const { status } = req.body;
      
      // Log activity
      await storage.createActivityLog({
        cliqUserId: user.id,
        activityType: 'task_updated',
        description: `Updated task status to ${status}`,
        notionPageId: id,
      });
      
      res.json({ success: true, id, status });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get recent documents
  app.get("/api/docs", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const userToken = await storage.getNotionToken(user.id);
      
      if (!userToken) {
        // User hasn't connected Notion yet
        return res.json([]);
      }
      
      // Use per-user token to create Notion client
      const notion = await notionService.getNotionClient(userToken);
      
      // Fetch recent pages from user's Notion workspace
      const docs = await notionService.getRecentPages(notion);
      
      res.json(docs);
    } catch (error: any) {
      console.error('Error fetching docs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Search Notion
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const userToken = await storage.getNotionToken(user.id);
      const query = req.query.query as string;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      if (!userToken) {
        // User hasn't connected Notion yet
        return res.json([]);
      }
      
      // Use per-user token to create Notion client
      const notion = await notionService.getNotionClient(userToken);
      
      // Search user's Notion workspace
      const results = await notionService.searchNotion(notion, query);
      
      // Log search activity
      await storage.createActivityLog({
        cliqUserId: user.id,
        activityType: 'search',
        description: `Searched for "${query}"`,
      });
      
      res.json(results);
    } catch (error: any) {
      console.error('Error searching Notion:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get activity feed
  app.get("/api/activity", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const activities = await storage.getActivityLogByUserId(user.id, 20);
      
      // Transform to expected format
      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        description: activity.description,
        pageTitle: activity.notionPageTitle,
        pageUrl: activity.notionPageUrl,
        timestamp: activity.createdAt.toISOString(),
      }));
      
      res.json(formattedActivities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Settings ====================
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      let settings = await storage.getNotificationSettings(user.id);
      
      if (!settings) {
        settings = await storage.createOrUpdateNotificationSettings({
          cliqUserId: user.id,
          remindersEnabled: true,
          reminderHoursBefore: 24,
          notifyOnTaskAssigned: true,
          notifyOnTaskUpdated: true,
        });
      }
      
      res.json({
        remindersEnabled: settings.remindersEnabled,
        notifyOnTaskAssigned: settings.notifyOnTaskAssigned,
        notifyOnTaskUpdated: settings.notifyOnTaskUpdated,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      const user = await getOrCreateCliqUser(req);
      const updates = req.body;
      
      const settings = await storage.createOrUpdateNotificationSettings({
        cliqUserId: user.id,
        ...updates,
      });
      
      res.json({
        remindersEnabled: settings.remindersEnabled,
        notifyOnTaskAssigned: settings.notifyOnTaskAssigned,
        notifyOnTaskUpdated: settings.notifyOnTaskUpdated,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Slash Commands ====================
  app.post("/api/cliq/slash", async (req: Request, res: Response) => {
    try {
      const { text, user_id, channel_id } = req.body;
      
      // Parse command
      const parts = text.trim().split(/\s+/);
      const subcommand = parts[0];
      
      if (subcommand === 'connect') {
        const message = cliqService.formatSlashCommandResponse({
          type: 'info',
          title: 'Connect Notion',
          description: 'Click the button below to connect your Notion workspace',
          actionUrl: '/api/auth/notion/start',
          actionLabel: 'Connect Notion',
        });
        return res.json(message);
      }
      
      if (subcommand === 'task') {
        const action = parts[1];
        if (action === 'add') {
          // Parse task title and parameters
          const restText = parts.slice(2).join(' ');
          const title = restText.replace(/--due\s+[\d-]+/g, '').trim();
          const dueMatch = restText.match(/--due\s+([\d-]+)/);
          const dueDate = dueMatch ? dueMatch[1] : undefined;
          
          // For demo, create mock task
          const message = cliqService.formatSlashCommandResponse({
            type: 'success',
            title: 'Task Created',
            description: `Created task: "${title}"${dueDate ? `\nDue: ${dueDate}` : ''}`,
            actionUrl: 'https://notion.so/demo-task',
            actionLabel: 'View in Notion',
          });
          
          return res.json(message);
        }
      }
      
      if (subcommand === 'search') {
        const query = parts.slice(1).join(' ');
        const message = cliqService.formatSlashCommandResponse({
          type: 'info',
          title: 'Search Notion',
          description: `Searching for: "${query}"`,
          actionUrl: `/?tab=search&q=${encodeURIComponent(query)}`,
          actionLabel: 'View Results',
        });
        return res.json(message);
      }
      
      // Unknown command
      const message = cliqService.formatSlashCommandResponse({
        type: 'info',
        title: 'Available Commands',
        description: '• /notion connect - Connect your Notion account\n• /notion task add <title> --due YYYY-MM-DD - Create a task\n• /notion search <query> - Search your workspace',
      });
      res.json(message);
      
    } catch (error: any) {
      const message = cliqService.formatSlashCommandResponse({
        type: 'error',
        title: 'Error',
        description: error.message,
      });
      res.json(message);
    }
  });

  // ==================== Message Actions ====================
  app.post("/api/cliq/message-action", async (req: Request, res: Response) => {
    try {
      const { message_text, message_id, channel_id, user_id } = req.body;
      
      // Create page from message
      const title = `Message from Cliq - ${new Date().toLocaleDateString()}`;
      const content = message_text;
      
      // For demo, create mock page
      const pageUrl = 'https://notion.so/saved-message';
      
      const message = cliqService.formatSlashCommandResponse({
        type: 'success',
        title: 'Saved to Notion',
        description: `Message saved as: "${title}"`,
        actionUrl: pageUrl,
        actionLabel: 'View in Notion',
      });
      
      res.json(message);
    } catch (error: any) {
      const message = cliqService.formatSlashCommandResponse({
        type: 'error',
        title: 'Error',
        description: 'Failed to save message to Notion',
      });
      res.json(message);
    }
  });

  // ==================== Notion Webhooks ====================
  app.post("/api/notion/webhook", async (req: Request, res: Response) => {
    try {
      const { page_id, action, properties } = req.body;
      
      // Find mapping to determine which Cliq user to notify
      const mapping = await storage.getMappingByNotionPageId(page_id);
      
      if (mapping) {
        const user = await storage.getCliqUser(mapping.cliqUserId);
        if (user) {
          // Send notification based on action
          if (action === 'updated') {
            await cliqService.sendTaskUpdatedNotification({
              userId: user.cliqUserId,
              taskTitle: properties?.title || 'Task',
              taskUrl: `https://notion.so/${page_id}`,
              changes: 'Task has been updated',
            });
          }
        }
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
