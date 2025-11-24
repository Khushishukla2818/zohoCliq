// Notion service layer - handles all Notion API interactions
// Supports both global Replit connector (for demo) and per-user OAuth tokens

import { Client } from '@notionhq/client';
import type { NotionToken } from '@shared/schema';

// Get Notion client with per-user OAuth token
export async function getNotionClientForUser(userToken: NotionToken): Promise<Client> {
  return new Client({ auth: userToken.accessToken });
}

// Get global Notion client using Replit connector (fallback for demo)
async function getGlobalNotionClient(): Promise<Client> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Authentication token not found');
  }

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

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  
  return new Client({ auth: accessToken });
}

export async function getGlobalConnectionInfo() {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) {
      return { isConnected: false };
    }

    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      workspaceName: connectionSettings.settings?.workspace_name || 'Connected Workspace',
      workspaceIcon: connectionSettings.settings?.workspace_icon,
      botId: connectionSettings.settings?.bot_id,
    };
  } catch {
    return { isConnected: false };
  }
}

// Get Notion client - uses per-user token if available, otherwise falls back to global
export async function getNotionClient(userToken?: NotionToken | null): Promise<Client> {
  if (userToken) {
    return getNotionClientForUser(userToken);
  }
  return getGlobalNotionClient();
}

// Search Notion workspace - requires user's Notion client
export async function searchNotion(notion: Client, query: string) {
  const response = await notion.search({
    query,
    filter: {
      property: 'object',
      value: 'page'
    },
    page_size: 20,
  });

  return response.results.map((result: any) => ({
    id: result.id,
    title: result.properties?.title?.title?.[0]?.text?.content || 
           result.properties?.Name?.title?.[0]?.text?.content ||
           'Untitled',
    type: result.object === 'database' ? 'database' : 'page',
    icon: result.icon?.emoji || result.icon?.external?.url,
    url: result.url,
    parent: result.parent?.database_id ? 'In a database' : undefined,
  }));
}

// Get recent pages - requires user's Notion client
export async function getRecentPages(notion: Client) {
  const response = await notion.search({
    filter: {
      property: 'object',
      value: 'page'
    },
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time'
    },
    page_size: 10,
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties?.title?.title?.[0]?.text?.content || 
           page.properties?.Name?.title?.[0]?.text?.content ||
           'Untitled',
    icon: page.icon?.emoji || page.icon?.external?.url,
    lastEditedTime: page.last_edited_time,
    url: page.url,
  }));
}

// Update page properties - requires user's Notion client
export async function updatePage(notion: Client, pageId: string, properties: any) {
  const response = await notion.pages.update({
    page_id: pageId,
    properties,
  });

  return response;
}

// Create a simple page - requires user's Notion client
export async function createPage(notion: Client, params: {
  title: string;
  content?: string;
  parentPageId?: string;
}) {
  const pageData: any = {
    properties: {
      title: {
        title: [{ text: { content: params.title } }]
      }
    },
  };

  if (params.content) {
    pageData.children = [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: params.content } }]
        }
      }
    ];
  }

  if (params.parentPageId) {
    pageData.parent = { page_id: params.parentPageId };
  } else {
    // Create in default workspace
    pageData.parent = { type: 'workspace', workspace: true };
  }

  const response = await notion.pages.create(pageData);

  return {
    id: response.id,
    url: response.url,
  };
}

// Create a page from text - requires user's Notion client
export async function createPageFromText(notion: Client, params: {
  title: string;
  content: string;
  parentPageId?: string;
}) {
  const pageData: any = {
    properties: {
      title: {
        title: [{ text: { content: params.title } }]
      }
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: params.content } }]
        }
      }
    ],
  };

  if (params.parentPageId) {
    pageData.parent = { page_id: params.parentPageId };
  } else {
    // Create in default workspace
    pageData.parent = { type: 'workspace', workspace: true };
  }

  const response = await notion.pages.create(pageData);

  return {
    id: response.id,
    url: response.url,
  };
}
