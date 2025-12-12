import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    // For PDF files, we'll read as text (basic extraction)
    // In production, you'd use a library like pdf.js or send to backend
    if (file.type === "application/pdf") {
      // Simple text extraction - in production use pdf-parse or similar
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractPdfText(arrayBuffer);
      return text || `[PDF Content from ${file.name}]\n\nNote: Full PDF parsing requires additional backend processing. For now, please paste the JD content manually or use a DOCX file.`;
    }

    // For DOCX files
    if (file.name.endsWith(".docx")) {
      // Basic DOCX text extraction
      const arrayBuffer = await file.arrayBuffer();
      const text = await extractDocxText(arrayBuffer);
      return text;
    }

    // For text files
    return await file.text();
  }, []);

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
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".txt");

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file.",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      try {
        const text = await extractTextFromFile(file);
        onJdUploaded(file.name, text);
        toast({
          title: "JD Imported Successfully",
          description: `${file.name} has been imported.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Could not extract text from the file.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    },
    [extractTextFromFile, onJdUploaded]
  );

  if (compact && fileName) {
    return (
      <>
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
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
                <p className="text-xs text-muted-foreground">Click to preview or change</p>
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
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Extracting text...</p>
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
      />
    </div>
  );
}

// Basic PDF text extraction (simplified - for production use pdf.js or backend)
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
    
    // Try to find readable text in the PDF
    const matches = text.match(/\/Text\s*\((.*?)\)/g);
    if (matches) {
      return matches.map((m) => m.replace(/\/Text\s*\(|\)/g, "")).join(" ");
    }

    // Try to extract text between stream markers
    const streamMatches = text.match(/stream\s*([\s\S]*?)\s*endstream/g);
    if (streamMatches) {
      const readable = streamMatches
        .map((s) => s.replace(/stream|endstream/g, ""))
        .filter((s) => /[a-zA-Z]{3,}/.test(s))
        .join("\n");
      if (readable.length > 50) return readable;
    }

    return "";
  } catch {
    return "";
  }
}

// Basic DOCX text extraction
async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // DOCX is a zip file - for proper extraction you'd use jszip + xml parsing
    // This is a simplified version
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
    
    // Try to extract text content from XML
    const matches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches) {
      return matches
        .map((m) => m.replace(/<w:t[^>]*>|<\/w:t>/g, ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    return `[DOCX file detected - content extraction may be limited. For best results, paste the JD content directly.]`;
  } catch {
    return "";
  }
}
