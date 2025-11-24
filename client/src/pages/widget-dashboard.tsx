import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutDashboard, CheckSquare, FileText, Search, Activity, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectionBanner } from "@/components/widget/connection-banner";
import { StatsDashboard } from "@/components/widget/stats-dashboard";
import { TaskFilters, type TaskFilter, type TaskSort } from "@/components/widget/task-filters";
import { QuickActions } from "@/components/widget/quick-actions";
import { TaskCard } from "@/components/widget/task-card";
import { DocumentItem } from "@/components/widget/document-item";
import { SearchInterface } from "@/components/widget/search-interface";
import { ActivityFeed } from "@/components/widget/activity-feed";
import { SettingsPanel } from "@/components/widget/settings-panel";
import { EmptyState } from "@/components/widget/empty-state";
import { LoadingGrid } from "@/components/widget/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { NotionTask, NotionDocument, SearchResult, ActivityItem } from "@shared/schema";

export default function WidgetDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilters, setTaskFilters] = useState<TaskFilter>({
    search: "",
    status: "all",
    assignee: "all",
  });
  const [taskSort, setTaskSort] = useState<TaskSort>({
    field: "dueDate",
    direction: "asc",
  });

  // Check connection status
  const { data: connectionStatus, isLoading: isLoadingConnection } = useQuery<{
    isConnected: boolean;
    workspaceName?: string;
    workspaceIcon?: string;
  }>({
    queryKey: ['/api/connection/status'],
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<NotionTask[]>({
    queryKey: ['/api/tasks'],
    enabled: connectionStatus?.isConnected,
  });

  // Fetch recent documents
  const { data: documents = [], isLoading: isLoadingDocs } = useQuery<NotionDocument[]>({
    queryKey: ['/api/docs'],
    enabled: connectionStatus?.isConnected,
  });

  // Search results
  const { data: searchResults = [], isLoading: isSearching } = useQuery<SearchResult[]>({
    queryKey: ['/api/search', searchQuery],
    enabled: connectionStatus?.isConnected && searchQuery.length >= 2,
  });

  // Activity feed
  const { data: activities = [], isLoading: isLoadingActivity } = useQuery<ActivityItem[]>({
    queryKey: ['/api/activity'],
    enabled: connectionStatus?.isConnected,
  });

  // Notification settings
  const { data: settings } = useQuery<{
    remindersEnabled: boolean;
    notifyOnTaskAssigned: boolean;
    notifyOnTaskUpdated: boolean;
  }>({
    queryKey: ['/api/settings'],
    enabled: connectionStatus?.isConnected,
  });

  // Update task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiRequest('PATCH', `/api/tasks/${id}`, { 
        status: completed ? 'Done' : 'To Do' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  // Update settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<typeof settings>) => {
      return apiRequest('PATCH', '/api/settings', newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    },
  });

  const handleConnect = () => {
    window.open('/api/auth/notion/start', '_blank');
  };

  const handleDisconnect = async () => {
    try {
      await apiRequest('POST', '/api/auth/notion/disconnect', {});
      queryClient.invalidateQueries({ queryKey: ['/api/connection/status'] });
      toast({
        title: "Disconnected",
        description: "Your Notion account has been disconnected",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to disconnect Notion account",
        variant: "destructive",
      });
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (taskFilters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(taskFilters.search.toLowerCase())
      );
    }

    if (taskFilters.status !== "all") {
      filtered = filtered.filter(task => task.status === taskFilters.status);
    }

    const sorted = [...filtered].sort((a, b) => {
      const direction = taskSort.direction === "asc" ? 1 : -1;
      
      switch (taskSort.field) {
        case "title":
          return direction * a.title.localeCompare(b.title);
        case "status":
          return direction * a.status.localeCompare(b.status);
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return direction * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case "assignee":
          const aAssignee = a.assignee || "";
          const bAssignee = b.assignee || "";
          return direction * aAssignee.localeCompare(bAssignee);
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, taskFilters, taskSort]);

  const isConnected = connectionStatus?.isConnected ?? false;

  return (
    <div className="min-h-screen bg-background p-6" data-testid="page-widget-dashboard">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground mb-1">
              Notion for Cliq
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your Notion workspace from Zoho Cliq
            </p>
          </div>
          <ThemeToggle />
        </div>

        {!isLoadingConnection && !isConnected && (
          <div className="mb-6">
            <ConnectionBanner onConnect={handleConnect} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 mb-6" data-testid="tabs-navigation">
            <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2" data-testid="tab-tasks">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2" data-testid="tab-docs">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2" data-testid="tab-search">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2" data-testid="tab-activity">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            {!isConnected ? (
              <EmptyState
                icon={LayoutDashboard}
                title="Connect Notion to view your dashboard"
                description="Connect your Notion account to see insights, stats, and productivity metrics"
                actionLabel="Connect Notion"
                onAction={handleConnect}
              />
            ) : (
              <StatsDashboard 
                tasks={tasks} 
                activities={activities}
                isLoading={isLoadingTasks || isLoadingActivity}
              />
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            {!isConnected ? (
              <EmptyState
                icon={CheckSquare}
                title="Connect Notion to view tasks"
                description="Connect your Notion account to see and manage your tasks from Cliq"
                actionLabel="Connect Notion"
                onAction={handleConnect}
              />
            ) : isLoadingTasks ? (
              <LoadingGrid type="task" count={4} />
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks yet"
                description="Create tasks in Notion or use the /notion command in Cliq"
              />
            ) : (
              <div className="space-y-4">
                <TaskFilters
                  onFilterChange={setTaskFilters}
                  onSortChange={setTaskSort}
                />
                {filteredAndSortedTasks.length === 0 ? (
                  <EmptyState
                    icon={CheckSquare}
                    title="No tasks match your filters"
                    description="Try adjusting your filters to see more tasks"
                  />
                ) : (
                  <div className="space-y-3" data-testid="list-tasks">
                    {filteredAndSortedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        {...task}
                        onStatusChange={(id, checked) => 
                          updateTaskStatus.mutate({ id, completed: checked })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="docs" className="mt-0">
            {!isConnected ? (
              <EmptyState
                icon={FileText}
                title="Connect Notion to view documents"
                description="Connect your Notion account to access your recent documents"
                actionLabel="Connect Notion"
                onAction={handleConnect}
              />
            ) : isLoadingDocs ? (
              <LoadingGrid type="doc" count={5} />
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No recent documents"
                description="Your recently accessed Notion pages will appear here"
              />
            ) : (
              <div className="space-y-2" data-testid="list-docs">
                {documents.map((doc) => (
                  <DocumentItem key={doc.id} {...doc} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            {!isConnected ? (
              <EmptyState
                icon={Search}
                title="Connect Notion to search"
                description="Connect your Notion account to search across your workspace"
                actionLabel="Connect Notion"
                onAction={handleConnect}
              />
            ) : (
              <SearchInterface
                onSearch={setSearchQuery}
                results={searchResults}
                isLoading={isSearching}
              />
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            {!isConnected ? (
              <EmptyState
                icon={Activity}
                title="Connect Notion to view activity"
                description="Connect your Notion account to see your recent interactions"
                actionLabel="Connect Notion"
                onAction={handleConnect}
              />
            ) : isLoadingActivity ? (
              <LoadingGrid type="activity" count={4} />
            ) : (
              <ActivityFeed activities={activities} />
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsPanel
              isConnected={isConnected}
              workspaceName={connectionStatus?.workspaceName}
              workspaceIcon={connectionStatus?.workspaceIcon}
              remindersEnabled={settings?.remindersEnabled ?? true}
              notifyOnTaskAssigned={settings?.notifyOnTaskAssigned ?? true}
              notifyOnTaskUpdated={settings?.notifyOnTaskUpdated ?? true}
              onReminderToggle={(enabled) => 
                updateSettings.mutate({ remindersEnabled: enabled })
              }
              onTaskAssignedToggle={(enabled) => 
                updateSettings.mutate({ notifyOnTaskAssigned: enabled })
              }
              onTaskUpdatedToggle={(enabled) => 
                updateSettings.mutate({ notifyOnTaskUpdated: enabled })
              }
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </TabsContent>
        </Tabs>
      </div>

      {isConnected && (
        <QuickActions
          onTaskCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
            queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
          }}
          onNoteCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/docs'] });
            queryClient.invalidateQueries({ queryKey: ['/api/activity'] });
          }}
        />
      )}
    </div>
  );
}
