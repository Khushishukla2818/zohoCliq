import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";

interface ConnectionBannerProps {
  onConnect: () => void;
}

export function ConnectionBanner({ onConnect }: ConnectionBannerProps) {
  return (
    <Alert className="border-primary/50 bg-primary/5" data-testid="banner-connection">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <LinkIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <AlertDescription className="text-sm font-medium text-foreground">
            Connect your Notion account to start managing tasks and documents from Cliq
          </AlertDescription>
        </div>
        <Button 
          onClick={onConnect} 
          size="sm" 
          data-testid="button-connect-notion"
        >
          Connect Notion
        </Button>
      </div>
    </Alert>
  );
}
