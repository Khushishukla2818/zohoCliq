import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
}

export interface TaskFilter {
  search: string;
  status: string;
  assignee: string;
}

export interface TaskSort {
  field: "title" | "status" | "dueDate" | "assignee";
  direction: "asc" | "desc";
}

export function TaskFilters({ onFilterChange, onSortChange }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilter>({
    search: "",
    status: "all",
    assignee: "all",
  });
  const [sort, setSort] = useState<TaskSort>({
    field: "dueDate",
    direction: "asc",
  });

  const handleSearchChange = (search: string) => {
    const newFilters = { ...filters, search };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (field: TaskSort["field"]) => {
    const newSort = { ...sort, field };
    setSort(newSort);
    onSortChange(newSort);
  };

  const toggleSortDirection = () => {
    const newSort = { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" } as TaskSort;
    setSort(newSort);
    onSortChange(newSort);
  };

  const handleClearFilters = () => {
    const defaultFilters = { search: "", status: "all", assignee: "all" };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.assignee !== "all";

  return (
    <div className="space-y-3" data-testid="task-filters">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-task-search"
          />
        </div>
        
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
          data-testid="button-toggle-filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 px-1 min-w-[1.25rem] h-5">
              •
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-md border bg-card animate-in fade-in-50 duration-200">
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1.5 block">Status</label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1.5 block">Sort By</label>
            <div className="flex gap-2">
              <Select 
                value={sort.field} 
                onValueChange={(value) => handleSortChange(value as TaskSort["field"])}
              >
                <SelectTrigger data-testid="select-sort-field" className="flex-1">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="assignee">Assignee</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortDirection}
                data-testid="button-toggle-sort-direction"
                title={sort.direction === "asc" ? "Ascending" : "Descending"}
              >
                <ArrowUpDown className={`h-4 w-4 ${sort.direction === "desc" ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
