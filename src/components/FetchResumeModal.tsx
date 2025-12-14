import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Cloud,
  Linkedin,
  Github,
  Link,
  FileText,
  Loader2,
  Check,
  AlertTriangle,
  X,
  RefreshCw,
  Eye,
  Trash2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface FetchSource {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const FETCH_SOURCES: FetchSource[] = [
  { id: "google-drive", name: "Google Drive", icon: <Cloud className="h-4 w-4" /> },
  { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { id: "github", name: "GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "url", name: "Paste URL", icon: <Link className="h-4 w-4" /> },
];

export interface FetchedResume {
  id: string;
  name: string;
  source: string;
  status: "fetching" | "success" | "partial" | "error";
  errorMessage?: string;
  isBestMatch?: boolean;
  selected: boolean;
  file?: File;
  lastUpdated?: string;
}

interface FetchResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResumesConfirmed: (resumes: FetchedResume[]) => void;
}

export function FetchResumeModal({
  open,
  onOpenChange,
  onResumesConfirmed,
}: FetchResumeModalProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [fetchedResumes, setFetchedResumes] = useState<FetchedResume[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const handleSourceSelect = async (sourceId: string) => {
    setSelectedSource(sourceId);
    setIsFetching(true);

    // Create 3 placeholder cards immediately
    const placeholders: FetchedResume[] = [
      {
        id: `fetch-1-${Date.now()}`,
        name: "Fetching Resume 1…",
        source: sourceId,
        status: "fetching",
        selected: true,
      },
      {
        id: `fetch-2-${Date.now()}`,
        name: "Fetching Resume 2…",
        source: sourceId,
        status: "fetching",
        selected: true,
      },
      {
        id: `fetch-3-${Date.now()}`,
        name: "Fetching Resume 3…",
        source: sourceId,
        status: "fetching",
        selected: true,
      },
    ];

    setFetchedResumes(placeholders);

    // Simulate incremental fetching with realistic delays
    const sourceName = FETCH_SOURCES.find((s) => s.id === sourceId)?.name || sourceId;

    // Fetch resume 1 (success)
    await simulateFetch(1500);
    setFetchedResumes((prev) =>
      prev.map((r, i) =>
        i === 0
          ? {
              ...r,
              name: "John_Smith_Resume_2024.pdf",
              status: "success" as const,
              isBestMatch: true,
              lastUpdated: "Updated 2 days ago",
            }
          : r
      )
    );

    // Fetch resume 2 (partial/warning)
    await simulateFetch(1200);
    setFetchedResumes((prev) =>
      prev.map((r, i) =>
        i === 1
          ? {
              ...r,
              name: "Sarah_Johnson_CV.docx",
              status: "success" as const,
              lastUpdated: "Updated 1 week ago",
            }
          : r
      )
    );

    // Fetch resume 3 (could succeed or fail randomly for demo)
    await simulateFetch(1000);
    const shouldFail = Math.random() > 0.7;
    setFetchedResumes((prev) =>
      prev.map((r, i) =>
        i === 2
          ? {
              ...r,
              name: shouldFail ? "Resume_3" : "Mike_Chen_Developer_Resume.pdf",
              status: shouldFail ? ("error" as const) : ("success" as const),
              errorMessage: shouldFail ? "Could not access file — check permissions" : undefined,
              lastUpdated: shouldFail ? undefined : "Updated 3 days ago",
            }
          : r
      )
    );

    setIsFetching(false);

    // Show toast if any errors
    const hasErrors = shouldFail;
    if (hasErrors) {
      toast({
        title: "Some resumes could not be fetched",
        description: "Check the source or try another.",
        variant: "destructive",
      });
    }
  };

  const simulateFetch = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleRetry = async (resumeId: string) => {
    setFetchedResumes((prev) =>
      prev.map((r) =>
        r.id === resumeId ? { ...r, status: "fetching" as const, errorMessage: undefined } : r
      )
    );

    await simulateFetch(1500);

    setFetchedResumes((prev) =>
      prev.map((r) =>
        r.id === resumeId
          ? {
              ...r,
              name: "Recovered_Resume.pdf",
              status: "success" as const,
              lastUpdated: "Just fetched",
            }
          : r
      )
    );
  };

  const handleToggleSelect = (resumeId: string) => {
    setFetchedResumes((prev) =>
      prev.map((r) => (r.id === resumeId ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleRemove = (resumeId: string) => {
    setFetchedResumes((prev) => prev.filter((r) => r.id !== resumeId));
  };

  const handleConfirm = () => {
    const selectedResumes = fetchedResumes.filter(
      (r) => r.selected && (r.status === "success" || r.status === "partial")
    );

    if (selectedResumes.length === 0) {
      toast({
        title: "No resumes selected",
        description: "Please select at least one successfully fetched resume.",
        variant: "destructive",
      });
      return;
    }

    onResumesConfirmed(selectedResumes);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setSelectedSource(null);
    setFetchedResumes([]);
    setIsFetching(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const successCount = fetchedResumes.filter(
    (r) => r.status === "success" || r.status === "partial"
  ).length;
  const selectedCount = fetchedResumes.filter(
    (r) => r.selected && (r.status === "success" || r.status === "partial")
  ).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fetch Resume from External Source</DialogTitle>
        </DialogHeader>

        {!selectedSource ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose a source to fetch resumes from:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {FETCH_SOURCES.map((source) => (
                <Button
                  key={source.id}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50"
                  onClick={() => handleSourceSelect(source.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {source.icon}
                  </div>
                  <span className="text-sm font-medium">{source.name}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Central Loading Indicator */}
            {isFetching && (
              <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm text-primary font-medium">
                  Fetching suggested resumes from{" "}
                  {FETCH_SOURCES.find((s) => s.id === selectedSource)?.name}…
                </span>
              </div>
            )}

            {/* Fetched Resume Cards */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {fetchedResumes.map((resume) => (
                <FetchedResumeCard
                  key={resume.id}
                  resume={resume}
                  onToggleSelect={() => handleToggleSelect(resume.id)}
                  onRemove={() => handleRemove(resume.id)}
                  onRetry={() => handleRetry(resume.id)}
                />
              ))}
            </div>

            {/* Completion Summary */}
            {!isFetching && fetchedResumes.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} of {successCount} resume{successCount !== 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} disabled={selectedCount === 0}>
                    Add to Upload Queue
                  </Button>
                </div>
              </div>
            )}

            {/* Back to source selection */}
            {!isFetching && (
              <Button
                variant="link"
                className="text-muted-foreground p-0 h-auto"
                onClick={() => {
                  setSelectedSource(null);
                  setFetchedResumes([]);
                }}
              >
                ← Choose different source
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FetchedResumeCard({
  resume,
  onToggleSelect,
  onRemove,
  onRetry,
}: {
  resume: FetchedResume;
  onToggleSelect: () => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const statusConfig = {
    fetching: {
      icon: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
      bgClass: "bg-muted/50",
      borderClass: "border-transparent",
    },
    success: {
      icon: <Check className="h-4 w-4 text-success" />,
      bgClass: "bg-success/5",
      borderClass: "border-success/20",
    },
    partial: {
      icon: <AlertTriangle className="h-4 w-4 text-warning" />,
      bgClass: "bg-warning/5",
      borderClass: "border-warning/20",
    },
    error: {
      icon: <X className="h-4 w-4 text-destructive" />,
      bgClass: "bg-destructive/5",
      borderClass: "border-destructive/20",
    },
  };

  const config = statusConfig[resume.status];

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        config.bgClass,
        config.borderClass,
        resume.status !== "fetching" && resume.status !== "error" && "hover:border-primary/30"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Selection Checkbox */}
        {resume.status !== "fetching" && resume.status !== "error" && (
          <button
            onClick={onToggleSelect}
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              resume.selected
                ? "bg-primary border-primary"
                : "border-muted-foreground/40 hover:border-primary"
            )}
            aria-label={resume.selected ? "Deselect resume" : "Select resume"}
          >
            {resume.selected && <Check className="h-3 w-3 text-primary-foreground" />}
          </button>
        )}

        {/* File Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            resume.status === "fetching" ? "bg-muted" : "bg-primary/10"
          )}
        >
          <FileText
            className={cn(
              "h-5 w-5",
              resume.status === "fetching" ? "text-muted-foreground" : "text-primary"
            )}
          />
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium truncate",
                resume.status === "fetching" && "text-muted-foreground animate-pulse"
              )}
            >
              {resume.name}
            </p>
            {resume.isBestMatch && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex-shrink-0"
              >
                <Star className="h-3 w-3 mr-1" />
                Best Match
              </Badge>
            )}
          </div>
          {resume.status === "fetching" && (
            <p className="text-xs text-muted-foreground">Fetching from source…</p>
          )}
          {resume.status === "success" && resume.lastUpdated && (
            <p className="text-xs text-muted-foreground">{resume.lastUpdated}</p>
          )}
          {resume.status === "partial" && (
            <p className="text-xs text-warning">Fetched but could not fully parse</p>
          )}
          {resume.status === "error" && (
            <p className="text-xs text-destructive">{resume.errorMessage}</p>
          )}
        </div>

        {/* Status Icon */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {config.icon}

          {/* Action Buttons */}
          {resume.status === "success" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Preview resume"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {resume.status === "error" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:text-primary"
              onClick={onRetry}
              title="Retry fetch"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {resume.status !== "fetching" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
              title="Remove from list"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
