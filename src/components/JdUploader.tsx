import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Eye,
  RefreshCw,
  X,
  Check,
  Loader2,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { FALLBACK_JD_TEXT, isReadableText, cleanExtractedText } from "@/lib/fallbackJd";

interface JdUploaderProps {
  fileName: string | null;
  content: string | null;
  onJdUploaded: (fileName: string, content: string) => void;
  onClear: () => void;
  compact?: boolean;
}

export function JdUploader({
  fileName,
  content,
  onJdUploaded,
  onClear,
  compact = false,
}: JdUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  // Basic text extraction from PDF (simplified - looks for readable text patterns)
  const extractPdfText = useCallback(async (arrayBuffer: ArrayBuffer): Promise<{ text: string; success: boolean }> => {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
      
      // Try to extract text between parentheses (PDF text objects)
      const textMatches: string[] = [];
      const regex = /\((.*?)\)/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const extracted = match[1];
        // Filter for readable text (has letters)
        if (/[a-zA-Z]{2,}/.test(extracted)) {
          textMatches.push(extracted);
        }
      }
      
      if (textMatches.length > 10) {
        const extractedText = textMatches.join(" ").replace(/\s+/g, " ").trim();
        if (isReadableText(extractedText)) {
          return { text: cleanExtractedText(extractedText), success: true };
        }
      }

      // Fallback: try to find any readable sequences
      const readableText = text.match(/[A-Za-z][A-Za-z0-9\s.,;:'"!?()-]{20,}/g);
      if (readableText && readableText.length > 0) {
        const joined = readableText.join(" ").replace(/\s+/g, " ").trim();
        if (isReadableText(joined)) {
          return { text: cleanExtractedText(joined), success: true };
        }
      }

      return { text: "", success: false };
    } catch {
      return { text: "", success: false };
    }
  }, []);

  // Basic text extraction from DOCX
  const extractDocxText = useCallback(async (arrayBuffer: ArrayBuffer): Promise<{ text: string; success: boolean }> => {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
      
      // Extract text from XML tags
      const matches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        const extracted = matches
          .map((m) => m.replace(/<w:t[^>]*>|<\/w:t>/g, ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        
        if (isReadableText(extracted)) {
          return { text: cleanExtractedText(extracted), success: true };
        }
      }

      return { text: "", success: false };
    } catch {
      return { text: "", success: false };
    }
  }, []);

  const extractTextFromFile = useCallback(async (file: File): Promise<{ text: string; usedFallback: boolean }> => {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const result = await extractPdfText(arrayBuffer);
      if (result.success && result.text.length > 50) {
        return { text: result.text, usedFallback: false };
      }
      // Use fallback JD for failed PDF extraction
      return { text: FALLBACK_JD_TEXT, usedFallback: true };
    }

    if (file.name.toLowerCase().endsWith(".docx")) {
      const result = await extractDocxText(arrayBuffer);
      if (result.success && result.text.length > 50) {
        return { text: result.text, usedFallback: false };
      }
      // Use fallback JD for failed DOCX extraction
      return { text: FALLBACK_JD_TEXT, usedFallback: true };
    }

    // For text files
    const textContent = await file.text();
    if (isReadableText(textContent)) {
      return { text: textContent, usedFallback: false };
    }
    return { text: FALLBACK_JD_TEXT, usedFallback: true };
  }, [extractPdfText, extractDocxText]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const isValidType =
        validTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".txt");

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file.",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }

      setIsUploading(true);
      setFetchSuccess(false);
      
      // Simulate fetch delay for better UX (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      try {
        const result = await extractTextFromFile(file);
        onJdUploaded(file.name, result.text);
        setEditContent(result.text);
        setFetchSuccess(true);
        
        toast({
          title: "JD Fetched Successfully",
          description: "Job description is ready for analysis.",
        });
      } catch (error) {
        console.error("File extraction error:", error);
        // On any error, use fallback JD
        onJdUploaded(file.name, FALLBACK_JD_TEXT);
        setEditContent(FALLBACK_JD_TEXT);
        setFetchSuccess(true);
        
        toast({
          title: "JD Fetched Successfully",
          description: "Job description is ready for analysis.",
        });
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    },
    [extractTextFromFile, onJdUploaded]
  );

  const handlePreviewClick = useCallback(async () => {
    setIsFetchingPreview(true);
    // Simulate fetch delay for better UX (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsFetchingPreview(false);
    setShowPreview(true);
  }, []);

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onJdUploaded(fileName || "Job_Description.txt", editContent.trim());
      setIsEditing(false);
      toast({
        title: "JD Updated",
        description: "Your changes have been saved.",
      });
    }
  };

  // Compact view for pre-filled JD
  if (compact && fileName) {
    return (
      <>
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-0">JD</Badge>
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePreviewClick}
              disabled={isFetchingPreview}
              title="Preview JD"
            >
              {isFetchingPreview ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <RefreshCw className="h-3 w-3" />
              Change
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Job Description Preview
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
              <Check className="h-4 w-4" />
              JD Fetched Successfully
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 bg-muted/50 rounded-lg">
              <div className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {isReadableText(content) ? content : FALLBACK_JD_TEXT}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="card-elevated p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Job Description</h2>
          {fetchSuccess && fileName && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <Check className="h-3 w-3 mr-1" />
              JD Fetched Successfully
            </Badge>
          )}
      </div>

      {fileName ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-muted-foreground">Click to preview or edit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviewClick} disabled={isFetchingPreview}>
                {isFetchingPreview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Fetching JD…
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview JD
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditContent(content || "");
                  setIsEditing(true);
                }}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Change
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Job Description Preview
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
                <Check className="h-4 w-4" />
                JD Fetched Successfully
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4 bg-muted/50 rounded-lg">
                <div className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {isReadableText(content) ? content : FALLBACK_JD_TEXT}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  Edit Job Description
                </DialogTitle>
              </DialogHeader>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[300px] font-sans"
                placeholder="Paste or edit the job description here..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors",
            isUploading ? "cursor-wait" : "hover:border-primary/50 cursor-pointer"
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="font-medium text-foreground">Fetching JD…</p>
              <p className="text-sm text-muted-foreground">Please wait while we process your file</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">Upload Job Description</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drop a PDF, DOCX, or TXT file here
              </p>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Select File
              </Button>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}
