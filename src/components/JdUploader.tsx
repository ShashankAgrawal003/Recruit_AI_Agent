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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

  // Extract text from PDF using pdf.js
  const extractPdfText = useCallback(async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }
      
      return fullText.trim();
    } catch (error) {
      console.error("PDF extraction error:", error);
      return "";
    }
  }, []);

  // Extract text from DOCX (basic XML parsing)
  const extractDocxText = useCallback(async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
      
      // Try to extract text content from XML
      const matches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        return matches
          .map((m) => m.replace(/<w:t[^>]*>|<\/w:t>/g, ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      }

      return "";
    } catch (error) {
      console.error("DOCX extraction error:", error);
      return "";
    }
  }, []);

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const text = await extractPdfText(arrayBuffer);
      if (text) return text;
      return `[Could not extract text from ${file.name}. Please paste the JD content manually.]`;
    }

    if (file.name.toLowerCase().endsWith(".docx")) {
      const text = await extractDocxText(arrayBuffer);
      if (text) return text;
      return `[Could not extract text from ${file.name}. Please paste the JD content manually.]`;
    }

    // For text files
    return await file.text();
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
      try {
        const text = await extractTextFromFile(file);
        if (!text || text.includes("[Could not extract")) {
          toast({
            title: "Text extraction limited",
            description: "You can edit the extracted text or paste manually.",
            variant: "default",
          });
        }
        onJdUploaded(file.name, text);
        setEditContent(text);
        toast({
          title: "JD Imported Successfully",
          description: `${file.name} has been imported.`,
        });
      } catch (error) {
        console.error("File extraction error:", error);
        toast({
          title: "Import Failed",
          description: "Could not extract text from the file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    },
    [extractTextFromFile, onJdUploaded]
  );

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
              onClick={() => setShowPreview(true)}
              title="Preview JD"
            >
              <Eye className="h-4 w-4" />
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
                {fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] p-4 bg-muted/50 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-sans">{content}</pre>
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
        {fileName && (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <Check className="h-3 w-3 mr-1" />
            Uploaded
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
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
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
                  {fileName}
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[60vh] p-4 bg-muted/50 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-sans">{content}</pre>
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
              <p className="font-medium text-foreground">Extracting JD...</p>
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
