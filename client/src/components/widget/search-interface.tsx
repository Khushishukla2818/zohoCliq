import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, FileText, Database, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  type: 'page' | 'database';
  icon?: string;
  url: string;
  parent?: string;
}

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
}

export function SearchInterface({ onSearch, results, isLoading }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      onSearch(value.trim());
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your Notion workspace..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedResults).map(([type, items]) => (
            <div key={type} className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {type === 'page' ? 'Pages' : 'Databases'}
              </h3>
              <div className="space-y-2">
                {items.map((result) => (
                  <Card
                    key={result.id}
                    className="p-3 hover-elevate cursor-pointer transition-all"
                    data-testid={`card-search-result-${result.id}`}
                    onClick={() => window.open(result.url, '_blank')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted flex-shrink-0">
                        {result.icon ? (
                          <span className="text-lg">{result.icon}</span>
                        ) : result.type === 'database' ? (
                          <Database className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </h4>
                        {result.parent && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.parent}
                          </p>
                        )}
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && query.length < 2 && query.length > 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}
