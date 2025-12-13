import { useState, useCallback, useRef } from "react";

export interface UploadingFile {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: "queued" | "uploading" | "complete" | "error";
  errorMessage?: string;
  result?: AnalysisResult;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  recommendedAction: "Interview" | "Reject" | "Hold";
}

const WEBHOOK_URL = "https://shashankagra03.app.n8n.cloud/webhook/133f7e03-39a1-4abd-b04c-47145eda3758";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function useResumeUpload(jdText?: string) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    const validFiles = fileArray.filter((file) => {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                     file.name.toLowerCase().endsWith(".docx");
      return isPdf || isDocx;
    });

    if (validFiles.length === 0) {
      console.warn("No valid files found. Only PDF and DOCX files are accepted.");
      return [];
    }

    const uploadingFiles: UploadingFile[] = validFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "queued" as const,
    }));

    setFiles((prev) => [...prev, ...uploadingFiles]);
    return uploadingFiles;
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setFiles([]);
    setIsUploading(false);
  }, []);

  const uploadFiles = useCallback(async () => {
    const queuedFiles = files.filter((f) => f.status === "queued" || f.status === "error");
    if (queuedFiles.length === 0) return;

    setIsUploading(true);
    abortControllerRef.current = new AbortController();

    for (const uploadFile of queuedFiles) {
      if (abortControllerRef.current?.signal.aborted) break;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0, errorMessage: undefined } : f
        )
      );

      try {
        // Build FormData - multipart/form-data POST
        const formData = new FormData();
        formData.append("resume_files", uploadFile.file, uploadFile.file.name);
        if (jdText && jdText.trim()) {
          formData.append("jd_text", jdText.trim());
        }

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id && f.status === "uploading"
                ? { ...f, progress: Math.min(f.progress + Math.random() * 15, 90) }
                : f
            )
          );
        }, 200);

        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current?.signal,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload failed:", errorText);
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different response formats from n8n
        const result = data.results?.[0] || data.result || data || {
          score: 0,
          summary: "No analysis returned from server",
          recommendedAction: "Hold" as const,
        };

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "complete",
                  progress: 100,
                  result: {
                    score: result.score ?? 0,
                    summary: result.summary ?? "No summary provided",
                    recommendedAction: result.recommendedAction ?? "Hold",
                  },
                }
              : f
          )
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          break;
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  errorMessage: error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  }, [files, jdText]);

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "queued", progress: 0, errorMessage: undefined } : f
      )
    );
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "uploading" ? { ...f, status: "queued", progress: 0 } : f
      )
    );
    setIsUploading(false);
  }, []);

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    clearAll,
    uploadFiles,
    retryFile,
    cancelUpload,
  };
}
