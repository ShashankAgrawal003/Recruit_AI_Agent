import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Trash2,
  Check,
  RefreshCw,
  X,
  Loader2,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadingFile } from "@/hooks/useResumeUpload";
import { FetchResumeModal, type FetchedResume } from "./FetchResumeModal";
import { toast } from "@/hooks/use-toast";

interface ResumeUploaderProps {
  files: UploadingFile[];
  isUploading: boolean;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
  onUpload: () => void;
  onCancelUpload: () => void;
  onClearAll: () => void;
  disabled?: boolean;
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
  disabled = false,
}: ResumeUploaderProps) {
  const singleInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [fetchModalOpen, setFetchModalOpen] = useState(false);

  const handleFetchedResumes = useCallback(
    (fetchedResumes: FetchedResume[]) => {
      // Convert fetched resumes to mock File objects for the upload queue
      const mockFiles: File[] = fetchedResumes.map((resume) => {
        // Create a mock file from the fetched resume data
        const blob = new Blob([""], { type: "application/pdf" });
        const file = new File([blob], resume.name, { type: "application/pdf" });
        return file;
      });

      if (mockFiles.length > 0) {
        onFilesSelected(mockFiles);
        toast({
          title: "Resumes added to queue",
          description: `${mockFiles.length} resume${mockFiles.length !== 1 ? "s" : ""} added from external source.`,
        });
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled || isUploading) return;
      if (e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected, disabled, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSingleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        // Only take the first file for single upload
        const singleFile = [e.target.files[0]];
        onFilesSelected(singleFile);
      }
      // Reset input to allow re-selecting same file
      e.target.value = "";
    },
    [onFilesSelected]
  );

  const handleBulkFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
      }
      // Reset input to allow re-selecting same files
      e.target.value = "";
    },
    [onFilesSelected]
  );

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const completeCount = files.filter((f) => f.status === "complete").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  const canUpload = (queuedCount > 0 || errorCount > 0) && !isUploading && !disabled;

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
            {uploadingCount > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Analyzing...
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
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            disabled || isUploading
              ? "border-muted bg-muted/20 cursor-not-allowed opacity-60"
              : "border-border hover:border-primary/50 cursor-pointer"
          )}
        >
          {/* Hidden file inputs */}
          <input
            ref={singleInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleSingleFileSelect}
            disabled={disabled || isUploading}
          />
          <input
            ref={bulkInputRef}
            type="file"
            accept=".pdf,.docx"
            multiple
            className="hidden"
            onChange={handleBulkFileSelect}
            disabled={disabled || isUploading}
          />

          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          
          <p className="font-medium text-foreground mb-1">
            {isUploading ? "Uploading resumes..." : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {isUploading ? "Please wait while files are being analyzed" : "or choose an upload option below"}
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => singleInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <FileText className="h-4 w-4" />
              Single File
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => bulkInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setFetchModalOpen(true)}
              disabled={disabled || isUploading}
            >
              <Cloud className="h-4 w-4" />
              Fetch Resume from…
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">Supports PDF, DOCX (Max 10MB)</p>

          {/* Fetch Resume Modal */}
          <FetchResumeModal
            open={fetchModalOpen}
            onOpenChange={setFetchModalOpen}
            onResumesConfirmed={handleFetchedResumes}
          />
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
                    ? `Analyzing ${uploadingCount} of ${files.length} files...`
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

              {canUpload && (
                <Button className="btn-gradient w-full mt-4 gap-2" onClick={onUpload}>
                  <Upload className="h-4 w-4" />
                  Upload to Analyze ({queuedCount + errorCount} file
                  {queuedCount + errorCount !== 1 ? "s" : ""})
                </Button>
              )}

              {isUploading && (
                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing resumes with AI...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {completeCount > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-4">
            Analysis Results
            <Badge variant="outline" className="ml-2 bg-success/10 text-success border-success/20">
              {completeCount} Complete
            </Badge>
          </h3>
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
              <p className="text-xs text-success">Analysis complete</p>
            ) : file.status === "error" ? (
              <p className="text-xs text-destructive">{file.errorMessage || "Upload failed — try again"}</p>
            ) : file.status === "uploading" ? (
              <p className="text-xs text-primary">Analyzing... {Math.round(file.progress)}%</p>
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
