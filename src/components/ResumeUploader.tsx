import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadingFile } from "@/hooks/useResumeUpload";

interface ResumeUploaderProps {
  files: UploadingFile[];
  isUploading: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  onUpload: () => void;
  onCancelUpload: () => void;
  onClearAll: () => void;
}

export function ResumeUploader({
  files,
  isUploading,
  onFilesSelected,
  onRemoveFile,
  onRetryFile,
  onUpload,
  onCancelUpload,
  onClearAll,
}: ResumeUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const completeCount = files.filter((f) => f.status === "complete").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  return (
    <div className="card-elevated p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Upload Resumes</h2>
        {files.length > 0 && (
          <div className="flex items-center gap-2">
            {completeCount > 0 && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {completeCount} Analyzed
              </Badge>
            )}
            {queuedCount > 0 && (
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {queuedCount} Queued
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                {errorCount} Failed
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => bulkInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
          />
          <input
            ref={bulkInputRef}
            type="file"
            accept=".pdf,.docx"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
          />

          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="font-medium text-foreground mb-1">Drag & drop files here</p>
          <p className="text-sm text-muted-foreground mb-4">or choose an upload option below</p>

          <div className="flex gap-3 justify-center" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              Single File
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => bulkInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">Supports PDF, DOCX (Max 10MB)</p>
        </div>

        {/* Upload Progress & Files List */}
        <div>
          {files.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              <p>No files selected. Drag & drop or click to add resumes.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {isUploading
                    ? `Uploading ${uploadingCount} of ${files.length} files...`
                    : `${files.length} file${files.length !== 1 ? "s" : ""} ready`}
                </span>
                <div className="flex gap-2">
                  {isUploading ? (
                    <Button
                      variant="link"
                      className="text-destructive p-0 h-auto text-sm"
                      onClick={onCancelUpload}
                    >
                      Cancel upload
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      className="text-muted-foreground p-0 h-auto text-sm"
                      onClick={onClearAll}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {files.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onRemove={() => onRemoveFile(file.id)}
                    onRetry={() => onRetryFile(file.id)}
                  />
                ))}
              </div>

              {(queuedCount > 0 || errorCount > 0) && !isUploading && (
                <Button className="btn-gradient w-full mt-4 gap-2" onClick={onUpload}>
                  <Upload className="h-4 w-4" />
                  Upload to Analyze ({queuedCount + errorCount} file
                  {queuedCount + errorCount !== 1 ? "s" : ""})
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {completeCount > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-4">Analysis Results</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files
              .filter((f) => f.status === "complete" && f.result)
              .map((file) => (
                <ResultCard key={file.id} file={file} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileItem({
  file,
  onRemove,
  onRetry,
}: {
  file: UploadingFile;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg transition-colors",
        file.status === "error" ? "bg-destructive/5 border border-destructive/20" : "bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText
            className={cn(
              "h-4 w-4 flex-shrink-0",
              file.status === "error" ? "text-destructive" : "text-muted-foreground"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            {file.status === "complete" ? (
              <p className="text-xs text-success">Analysis Complete</p>
            ) : file.status === "error" ? (
              <p className="text-xs text-destructive">{file.errorMessage || "Upload failed"}</p>
            ) : file.status === "uploading" ? (
              <p className="text-xs text-primary">Uploading... {Math.round(file.progress)}%</p>
            ) : (
              <p className="text-xs text-muted-foreground">{file.size}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file.status === "uploading" && (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          )}
          {file.status === "complete" && <Check className="h-4 w-4 text-success" />}
          {file.status === "error" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary hover:text-primary"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
            disabled={file.status === "uploading"}
          >
            {file.status === "error" ? (
              <X className="h-3 w-3" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      {file.status === "uploading" && <Progress value={file.progress} className="h-1" />}
    </div>
  );
}

function ResultCard({ file }: { file: UploadingFile }) {
  if (!file.result) return null;

  const actionColors = {
    Interview: "bg-success/10 text-success border-success/20",
    Reject: "bg-destructive/10 text-destructive border-destructive/20",
    Hold: "bg-warning/10 text-warning border-warning/20",
  };

  const scoreColor =
    file.result.score >= 80
      ? "text-success"
      : file.result.score >= 60
      ? "text-primary"
      : "text-warning";

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-medium truncate">{file.name}</p>
        </div>
        <Badge
          variant="outline"
          className={cn("flex-shrink-0", actionColors[file.result.recommendedAction])}
        >
          {file.result.recommendedAction}
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Match Score:</span>
          <span className={cn("text-lg font-bold", scoreColor)}>{file.result.score}%</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              file.result.score >= 80
                ? "bg-success"
                : file.result.score >= 60
                ? "bg-primary"
                : "bg-warning"
            )}
            style={{ width: `${file.result.score}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3">{file.result.summary}</p>
    </div>
  );
}
