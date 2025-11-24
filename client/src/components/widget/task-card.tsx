import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, User } from "lucide-react";
import { formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns";

interface TaskCardProps {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  assignee?: string;
  url: string;
  onStatusChange?: (id: string, checked: boolean) => void;
}

export function TaskCard({ id, title, status, dueDate, assignee, url, onStatusChange }: TaskCardProps) {
  const isCompleted = status === 'Done' || status === 'Completed';
  
  const formatDueDate = (date: string) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) return 'Today';
    if (isTomorrow(parsedDate)) return 'Tomorrow';
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'To Do':
      default:
        return 'outline';
    }
  };

  const getDueDateColor = (date?: string) => {
    if (!date) return 'text-muted-foreground';
    const parsedDate = parseISO(date);
    const now = new Date();
    const diffDays = (parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return 'text-destructive';
    if (diffDays < 1) return 'text-chart-3';
    return 'text-muted-foreground';
  };

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all"
      data-testid={`card-task-${id}`}
      onClick={() => window.open(url, '_blank')}
    >
      <div className="flex items-start gap-3">
        <Checkbox 
          checked={isCompleted}
          onCheckedChange={(checked) => {
            onStatusChange?.(id, checked as boolean);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5"
          data-testid={`checkbox-task-${id}`}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium mb-2 ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusVariant(status)} className="text-xs" data-testid={`badge-status-${id}`}>
              {status}
            </Badge>
            
            {dueDate && (
              <div className={`flex items-center gap-1 text-xs ${getDueDateColor(dueDate)}`}>
                <Calendar className="h-3 w-3" />
                <span data-testid={`text-due-${id}`}>{formatDueDate(dueDate)}</span>
              </div>
            )}
            
            {assignee && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span data-testid={`text-assignee-${id}`}>{assignee}</span>
              </div>
            )}
          </div>
        </div>
        
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
