import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SettingsPanelProps {
  isConnected: boolean;
  workspaceName?: string;
  workspaceIcon?: string;
  remindersEnabled: boolean;
  notifyOnTaskAssigned: boolean;
  notifyOnTaskUpdated: boolean;
  onReminderToggle: (enabled: boolean) => void;
  onTaskAssignedToggle: (enabled: boolean) => void;
  onTaskUpdatedToggle: (enabled: boolean) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SettingsPanel({
  isConnected,
  workspaceName,
  workspaceIcon,
  remindersEnabled,
  notifyOnTaskAssigned,
  notifyOnTaskUpdated,
  onReminderToggle,
  onTaskAssignedToggle,
  onTaskUpdatedToggle,
  onConnect,
  onDisconnect,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Notion Connection</h3>
            <p className="text-xs text-muted-foreground">Manage your Notion workspace connection</p>
          </div>
          
          <Separator />
          
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  {workspaceIcon ? (
                    <span className="text-xl">{workspaceIcon}</span>
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-chart-1" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground" data-testid="text-workspace-name">
                    {workspaceName || 'Connected Workspace'}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="w-full"
                data-testid="button-disconnect"
              >
                Disconnect Notion
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Not Connected</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={onConnect}
                className="w-full"
                data-testid="button-connect-settings"
              >
                Connect Notion
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Notifications</h3>
            <p className="text-xs text-muted-foreground">Configure your notification preferences</p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminders" className="text-sm font-normal cursor-pointer">
                Task Reminders
              </Label>
              <Switch
                id="reminders"
                checked={remindersEnabled}
                onCheckedChange={onReminderToggle}
                data-testid="switch-reminders"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="task-assigned" className="text-sm font-normal cursor-pointer">
                Notify when task assigned
              </Label>
              <Switch
                id="task-assigned"
                checked={notifyOnTaskAssigned}
                onCheckedChange={onTaskAssignedToggle}
                data-testid="switch-task-assigned"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="task-updated" className="text-sm font-normal cursor-pointer">
                Notify when task updated
              </Label>
              <Switch
                id="task-updated"
                checked={notifyOnTaskUpdated}
                onCheckedChange={onTaskUpdatedToggle}
                data-testid="switch-task-updated"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
