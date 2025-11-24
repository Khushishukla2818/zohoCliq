import { Card } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface DocumentItemProps {
  id: string;
  title: string;
  icon?: string;
  lastEditedTime: string;
  url: string;
}

export function DocumentItem({ id, title, icon, lastEditedTime, url }: DocumentItemProps) {
  const formatTime = (time: string) => {
    try {
      return formatDistanceToNow(parseISO(time), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card 
      className="p-3 hover-elevate cursor-pointer transition-all"
      data-testid={`card-doc-${id}`}
      onClick={() => window.open(url, '_blank')}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted flex-shrink-0">
          {icon ? (
            <span className="text-lg">{icon}</span>
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate mb-0.5" data-testid={`text-doc-title-${id}`}>
            {title}
          </h3>
          <p className="text-xs text-muted-foreground" data-testid={`text-doc-time-${id}`}>
            Edited {formatTime(lastEditedTime)}
          </p>
        </div>
        
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
