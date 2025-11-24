import { Card } from "@/components/ui/card";
import { CheckCircle2, FileText, Search as SearchIcon, MessageSquare, Edit, ExternalLink } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  pageTitle?: string;
  pageUrl?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <CheckCircle2 className="h-4 w-4 text-chart-1" />;
      case 'task_updated':
        return <Edit className="h-4 w-4 text-chart-3" />;
      case 'doc_created':
        return <FileText className="h-4 w-4 text-chart-2" />;
      case 'search':
        return <SearchIcon className="h-4 w-4 text-muted-foreground" />;
      case 'message_saved':
        return <MessageSquare className="h-4 w-4 text-chart-4" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground mt-1">Your Notion interactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <Card
          key={activity.id}
          className="p-3 hover-elevate transition-all"
          data-testid={`card-activity-${index}`}
        >
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0 mt-0.5">
              {getIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground mb-1" data-testid={`text-activity-desc-${index}`}>
                {activity.description}
              </p>
              
              {activity.pageTitle && activity.pageUrl && (
                <a
                  href={activity.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`link-activity-page-${index}`}
                >
                  {activity.pageTitle}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              
              <p className="text-xs text-muted-foreground mt-1" data-testid={`text-activity-time-${index}`}>
                {formatTime(activity.timestamp)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
