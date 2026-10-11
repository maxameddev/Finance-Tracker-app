import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple loading / error block shared by data pages.
export default function PageState({ loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 p-4 text-sm">
        <p className="text-destructive">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  return null;
}
