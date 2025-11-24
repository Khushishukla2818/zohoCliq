# Notion ⇄ Zoho Cliq Integration - Architecture

## Authentication Model

### Current Implementation: Shared Workspace Model

This integration uses a **shared workspace** authentication model via the Replit Notion connector:

**How it works:**
- One Notion workspace is connected at the application level (via Replit connector)
- All Cliq users in the team can interact with this shared Notion workspace
- User identity mapping tracks which Cliq user performed which action
- Each Cliq user's connection stores a copy of the workspace token for tracking

**Benefits:**
- ✅ Simpler setup - one-time Notion connection for entire team
- ✅ Team collaboration - all users work in the same Notion workspace
- ✅ Suitable for companies where teams share Notion workspaces
- ✅ Faster development - leverages Replit's OAuth handling

**Limitations:**
- ⚠️ All users access the same Notion workspace
- ⚠️ Cannot support users with different Notion workspaces
- ⚠️ Permissions are workspace-level, not per-user

### Alternative: Per-User OAuth Model (Not Implemented)

A true multi-tenant integration would require:

**Requirements:**
1. Notion OAuth app (client ID & secret registered with Notion)
2. Authorization code exchange flow
3. Refresh token handling
4. Per-user token storage with expiration
5. OAuth callback endpoint handling

**Implementation Path:**
```typescript
// 1. OAuth Start
app.get('/api/auth/notion/start', (req, res) => {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?
    client_id=${NOTION_CLIENT_ID}&
    response_type=code&
    owner=user&
    redirect_uri=${REDIRECT_URI}`;
  res.redirect(authUrl);
});

// 2. OAuth Callback
app.get('/api/auth/notion/callback', async (req, res) => {
  const { code } = req.query;
  const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      'Content-Type': 'application/json',
    },
  });
  
  const { access_token, refresh_token } = await tokenResponse.json();
  
  // Store per-user tokens
  await storage.createOrUpdateNotionToken({
    cliqUserId: user.id,
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });
});
```

## Data Flow

### Widget Dashboard
1. User opens widget → Frontend fetches connection status
2. If not connected → Shows "Connect Notion" button
3. User clicks connect → `/api/auth/notion/start` stores workspace token
4. Dashboard loads → Fetches tasks/docs/search from Notion API
5. Uses per-user stored token (currently same as workspace token)

### Slash Commands
1. User types `/notion task add` in Cliq
2. Cliq sends webhook to `/api/cliq/slash`
3. Backend creates Cliq user record
4. Backend uses Notion client to create page
5. Returns formatted response to Cliq

### Message Actions
1. User selects message → Clicks "Save to Notion"
2. Cliq sends webhook to `/api/cliq/message-action`
3. Backend creates Notion page from message content
4. Logs activity
5. Returns success response

## Database Schema

```
cliq_users
├── id (PK)
├── cliq_user_id (unique)
├── cliq_display_name
└── cliq_email

notion_tokens
├── id (PK)
├── cliq_user_id (FK)
├── access_token
├── bot_id
├── workspace_name
└── workspace_icon

activity_log
├── id (PK)
├── cliq_user_id (FK)
├── activity_type
├── description
└── created_at

notification_settings
├── id (PK)
├── cliq_user_id (FK)
├── reminders_enabled
├── notify_on_task_assigned
├── notify_on_mentions
└── quiet_hours_start/end
```

## For Production Migration to Per-User OAuth

If deploying this beyond demo/hackathon:

1. **Register Notion OAuth App**
   - Go to https://www.notion.so/my-integrations
   - Create new integration → Choose "Public integration"
   - Get Client ID and Client Secret
   - Configure redirect URI

2. **Update Schema**
   - Add `refresh_token` to `notion_tokens` table
   - Add `expires_at` timestamp
   - Add token refresh cron job

3. **Implement OAuth Flow**
   - Replace `/api/auth/notion/start` with proper redirect
   - Implement `/api/auth/notion/callback` with code exchange
   - Add token refresh logic

4. **Update Service Layer**
   - Remove global connector fallback
   - Require valid user token for all operations
   - Return 401 if token missing/expired

5. **Add Token Management**
   - Token revocation endpoint
   - Automatic refresh before expiry
   - Handle token expiry gracefully

## Current Status: Demo-Ready

✅ Complete database schema  
✅ Full frontend with widget dashboard  
✅ Backend API endpoints functional  
✅ Notion API integration working  
✅ Cliq webhook handlers  
✅ Activity logging  
✅ Cron scheduler  
✅ Clean error handling  

⚠️ Uses shared-workspace model (Replit connector)  
⚠️ Production would need per-user OAuth
