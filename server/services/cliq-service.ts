// Cliq service layer - handles sending messages and notifications to Zoho Cliq
// Note: This requires Zoho Cliq bot token and webhook URLs to be configured

export interface CliqMessage {
  text: string;
  card?: {
    title?: string;
    description?: string;
    theme?: 'modern-inline' | 'poll' | 'prompt';
  };
  bot?: {
    name?: string;
    image?: string;
  };
  buttons?: Array<{
    label: string;
    type?: string;
    action?: {
      type: string;
      data: any;
    };
  }>;
}

// Send message to Cliq channel
export async function sendCliqMessage(params: {
  channelId?: string;
  userId?: string;
  message: CliqMessage;
}) {
  // In a real implementation, this would call Zoho Cliq API
  // For now, we'll log the message and return success
  console.log('Sending Cliq message:', {
    channelId: params.channelId,
    userId: params.userId,
    message: params.message,
  });

  // TODO: Implement actual Cliq API call when Cliq bot token is available
  // const response = await fetch('https://cliq.zoho.com/api/v2/messages', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.CLIQ_BOT_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(params.message),
  // });

  return {
    success: true,
    messageId: `msg_${Date.now()}`,
  };
}

// Send task reminder notification
export async function sendTaskReminder(params: {
  userId: string;
  taskTitle: string;
  taskUrl: string;
  dueDate: string;
}) {
  const message: CliqMessage = {
    text: `Reminder: Task "${params.taskTitle}" is due ${params.dueDate}`,
    card: {
      title: '📋 Task Reminder',
      description: `**${params.taskTitle}**\n\nDue: ${params.dueDate}`,
      theme: 'modern-inline',
    },
    buttons: [
      {
        label: 'View in Notion',
        type: 'open.url',
        action: {
          type: 'open.url',
          data: { url: params.taskUrl },
        },
      },
    ],
  };

  return sendCliqMessage({
    userId: params.userId,
    message,
  });
}

// Send task assignment notification
export async function sendTaskAssignedNotification(params: {
  userId: string;
  taskTitle: string;
  taskUrl: string;
  assignedBy: string;
}) {
  const message: CliqMessage = {
    text: `${params.assignedBy} assigned you a task: ${params.taskTitle}`,
    card: {
      title: '✅ New Task Assigned',
      description: `**${params.taskTitle}**\n\nAssigned by: ${params.assignedBy}`,
      theme: 'modern-inline',
    },
    buttons: [
      {
        label: 'View Task',
        type: 'open.url',
        action: {
          type: 'open.url',
          data: { url: params.taskUrl },
        },
      },
    ],
  };

  return sendCliqMessage({
    userId: params.userId,
    message,
  });
}

// Send task update notification
export async function sendTaskUpdatedNotification(params: {
  userId: string;
  taskTitle: string;
  taskUrl: string;
  changes: string;
}) {
  const message: CliqMessage = {
    text: `Task updated: ${params.taskTitle}`,
    card: {
      title: '🔄 Task Updated',
      description: `**${params.taskTitle}**\n\n${params.changes}`,
      theme: 'modern-inline',
    },
    buttons: [
      {
        label: 'View Task',
        type: 'open.url',
        action: {
          type: 'open.url',
          data: { url: params.taskUrl },
        },
      },
    ],
  };

  return sendCliqMessage({
    userId: params.userId,
    message,
  });
}

// Format slash command response
export function formatSlashCommandResponse(params: {
  type: 'success' | 'error' | 'info';
  title: string;
  description: string;
  actionUrl?: string;
  actionLabel?: string;
}): CliqMessage {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const message: CliqMessage = {
    text: `${icons[params.type]} ${params.title}`,
    card: {
      title: `${icons[params.type]} ${params.title}`,
      description: params.description,
      theme: 'modern-inline',
    },
  };

  if (params.actionUrl && params.actionLabel) {
    message.buttons = [
      {
        label: params.actionLabel,
        type: 'open.url',
        action: {
          type: 'open.url',
          data: { url: params.actionUrl },
        },
      },
    ];
  }

  return message;
}
