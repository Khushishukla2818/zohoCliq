import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckSquare, FileText, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuickActionsProps {
  onTaskCreated?: () => void;
  onNoteCreated?: () => void;
}

export function QuickActions({ onTaskCreated, onNoteCreated }: QuickActionsProps) {
  const { toast } = useToast();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;

    setIsCreating(true);
    try {
      await apiRequest('POST', '/api/tasks', {
        title: taskTitle,
        status: 'To Do',
      });
      
      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });
      
      setTaskTitle("");
      setIsTaskDialogOpen(false);
      onTaskCreated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return;

    setIsCreating(true);
    try {
      await apiRequest('POST', '/api/notes', {
        title: noteTitle,
        content: noteContent,
      });
      
      toast({
        title: "Note created",
        description: "Your note has been created successfully",
      });
      
      setNoteTitle("");
      setNoteContent("");
      setIsNoteDialogOpen(false);
      onNoteCreated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="quick-actions">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover-elevate active-elevate-2"
            data-testid="button-quick-actions"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Quick Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsTaskDialogOpen(true)}
            className="gap-2 cursor-pointer"
            data-testid="menu-create-task"
          >
            <CheckSquare className="h-4 w-4" />
            Create Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsNoteDialogOpen(true)}
            className="gap-2 cursor-pointer"
            data-testid="menu-create-note"
          >
            <FileText className="h-4 w-4" />
            Create Note
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Quickly create a new task in your Notion workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                placeholder="Enter task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateTask();
                  }
                }}
                data-testid="input-task-title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTaskDialogOpen(false)}
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!taskTitle.trim() || isCreating}
              data-testid="button-create-task"
            >
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
            <DialogDescription>
              Quickly create a new note in your Notion workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Note Title</Label>
              <Input
                id="note-title"
                placeholder="Enter note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                data-testid="input-note-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content (optional)</Label>
              <Textarea
                id="note-content"
                placeholder="Enter note content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
                data-testid="input-note-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNoteDialogOpen(false)}
              data-testid="button-cancel-note"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNote}
              disabled={!noteTitle.trim() || isCreating}
              data-testid="button-create-note"
            >
              {isCreating ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
