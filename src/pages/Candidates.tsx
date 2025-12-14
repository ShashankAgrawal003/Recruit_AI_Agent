import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowRight,
  X,
  Eye,
  Check,
  Undo2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { type Candidate } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useResumeUpload, type AnalysisResult } from "@/hooks/useResumeUpload";
import { ResumeUploader } from "@/components/ResumeUploader";
import { JdUploader } from "@/components/JdUploader";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";

function ScoreBar({ score, level }: { score: number; level: string }) {
  const colorClass = {
    High: "bg-success",
    Good: "bg-primary",
    Low: "bg-warning",
  }[level] || "bg-muted";

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "text-sm font-semibold",
        level === "High" && "text-success",
        level === "Good" && "text-primary",
        level === "Low" && "text-warning"
      )}>
        {score}%
      </span>
      <span className={cn(
        "text-xs",
        level === "High" && "text-success",
        level === "Good" && "text-primary",
        level === "Low" && "text-warning"
      )}>
        {level}
      </span>
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, recommendedAction }: { status: Candidate["status"]; recommendedAction?: Candidate["recommendedAction"] }) {
  // Use recommendedAction if available for styling, otherwise fall back to status
  const displayStatus = recommendedAction || status;
  
  const styles: Record<string, string> = {
    "Pending Review": "status-pending",
    Shortlisted: "status-shortlisted",
    Rejected: "status-rejected",
    Hold: "status-paused",
    Interview: "status-shortlisted",
    Selected: "status-shortlisted",
    Reject: "status-rejected",
  };

  const displayText = recommendedAction || status;

  return <span className={cn("status-badge", styles[displayStatus] || "status-pending")}>{displayText}</span>;
}

// Default JD text for roles that have JD pre-filled
const DEFAULT_JD_TEXT = `We are looking for a Senior React Engineer with 5+ years of experience in React, TypeScript, and modern frontend development. Experience with Node.js, GraphQL, and cloud services is preferred.`;

export default function Candidates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getJobById, activeJobJd, setActiveJobJd, candidates, addCandidate, updateCandidate, kpis } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  // Get job ID from URL params
  const jobId = searchParams.get("job");
  const job = jobId ? getJobById(jobId) : null;

  // Determine if JD is pre-filled (role has existing JD) or needs upload
  const [localJdFileName, setLocalJdFileName] = useState<string | null>(null);
  const [localJdContent, setLocalJdContent] = useState<string | null>(null);
  
  // Check if the job has a pre-filled JD based on the hasJD property
  const hasPrefilledJd = job?.hasJD === true;
  
  useEffect(() => {
    if (hasPrefilledJd && !localJdContent) {
      // Pre-fill JD for active roles
      setLocalJdFileName("Senior_React_Engineer_JD.pdf");
      setLocalJdContent(DEFAULT_JD_TEXT);
    }
  }, [hasPrefilledJd, localJdContent]);

  // Use either pre-filled JD, context JD, or local JD
  const effectiveJdFileName = activeJobJd?.fileName || localJdFileName;
  const effectiveJdContent = activeJobJd?.content || localJdContent;

  // Initialize resume upload hook with JD text
  const {
    files,
    isUploading,
    addFiles,
    removeFile,
    clearAll,
    uploadFiles,
    retryFile,
    cancelUpload,
  } = useResumeUpload(effectiveJdContent || undefined);

  // Monitor completed file uploads and add them as candidates
  useEffect(() => {
    const completedFiles = files.filter(f => f.status === "complete" && f.result);
    
    completedFiles.forEach(file => {
      // Check if candidate with this file name already exists (avoid duplicates)
      const existingCandidate = candidates.find(c => c.resumeFileName === file.name);
      if (existingCandidate) return;
      
      const result = file.result as AnalysisResult;
      
      // Extract candidate name from filename (e.g., "Shashank_Agrawal_Resume.pdf" -> "Shashank Agrawal")
      const nameFromFile = file.name
        .replace(/\.(pdf|docx)$/i, '')
        .replace(/_resume|resume_|_cv|cv_/gi, '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const initials = nameFromFile.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n.charAt(0).toUpperCase())
        .join('');
      
      // Determine score level
      const scoreLevel = result.score >= 70 ? 'High' : result.score >= 50 ? 'Good' : 'Low';
      
      // Create new candidate from analysis result
      const newCandidate: Omit<Candidate, "id"> = {
        name: nameFromFile || "Unknown Candidate",
        initials: initials || "?",
        role: "Candidate", // Could be parsed from resume if available
        location: "Not specified",
        email: "",
        phone: "",
        skills: [],
        baseScore: result.score,
        weightedScore: result.score,
        scoreLevel,
        summary: result.summary || "No summary available",
        status: "Pending Review",
        recommendedAction: result.recommendedAction,
        experience: [],
        education: [],
        skillGaps: result.skill_gap_analysis?.map(sg => ({
          skill: sg.skill,
          priority: sg.priority,
          status: sg.status,
          note: sg.note,
        })) || [],
        resumeFileName: file.name,
        emailDrafts: result.emailDrafts,
        interviewDate: undefined,
      };
      
      addCandidate(newCandidate);
      toast({
        title: "Candidate analysis added successfully",
        description: `${nameFromFile} has been added to the pipeline.`,
      });
    });
  }, [files, candidates, addCandidate]);

  // JD handlers
  const handleJdUploaded = (fileName: string, content: string) => {
    setLocalJdFileName(fileName);
    setLocalJdContent(content);
    setActiveJobJd({ fileName, content });
  };

  const handleJdClear = () => {
    setLocalJdFileName(null);
    setLocalJdContent(null);
    setActiveJobJd(null);
  };

  // Determine if resume upload should be disabled (no JD uploaded for non-prefilled roles)
  const needsJdUpload = !hasPrefilledJd && !effectiveJdContent;

  // Sort candidates based on sortBy
  const sortedCandidates = [...candidates].sort((a, b) => {
    switch (sortBy) {
      case "score":
        return b.weightedScore - a.weightedScore;
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return 0; // No date field currently
      default:
        return 0;
    }
  });

  const filteredCandidates = sortedCandidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "Shortlisted" && (c.status === "Shortlisted" || c.recommendedAction === "Interview")) ||
      (statusFilter === "Pending" && c.status === "Pending Review");
    return matchesSearch && matchesStatus;
  });

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedCandidates.length >= 2) {
      navigate(`/compare?ids=${selectedCandidates.join(",")}`);
    }
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidate Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Manage, screen, and shortlist incoming applications efficiently.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {kpis.totalApplicants} Processed
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {kpis.shortlisted} Shortlisted
          </Badge>
        </div>
      </div>

      {/* JD Section - Show based on context */}
      {hasPrefilledJd ? (
        // Compact JD display for roles with pre-filled JD
        <JdUploader
          fileName={effectiveJdFileName}
          content={effectiveJdContent}
          onJdUploaded={handleJdUploaded}
          onClear={handleJdClear}
          compact
        />
      ) : (
        // Full JD upload section for roles needing JD upload
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-foreground">Step 1: Upload Job Description</h2>
            {!effectiveJdContent && (
              <span className="text-xs text-warning">(Required before uploading resumes)</span>
            )}
          </div>
          <JdUploader
            fileName={effectiveJdFileName}
            content={effectiveJdContent}
            onJdUploaded={handleJdUploaded}
            onClear={handleJdClear}
          />
        </div>
      )}

      {/* Upload Section with n8n Webhook Integration */}
      <div className="mb-6">
        {!hasPrefilledJd && effectiveJdContent && (
          <h2 className="font-semibold text-foreground mb-3">Step 2: Upload Resumes</h2>
        )}
        {needsJdUpload ? (
          <div className="card-elevated p-6 opacity-60">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Please upload a Job Description above before uploading resumes.
              </p>
            </div>
          </div>
        ) : (
          <ResumeUploader
            files={files}
            isUploading={isUploading}
            onFilesSelected={addFiles}
            onRemoveFile={removeFile}
            onRetryFile={retryFile}
            onUpload={uploadFiles}
            onCancelUpload={cancelUpload}
            onClearAll={clearAll}
            disabled={needsJdUpload}
          />
        )}
      </div>

      {/* Active JD Banner - Only show if JD is set */}
      {effectiveJdFileName && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-0">ACTIVE JD</Badge>
            <span className="font-medium">{job?.title || "Senior React Engineer"}</span>
            <span className="text-sm text-muted-foreground">ID: {job?.id || "RE-2024-003"}</span>
          </div>
          <Button variant="link" className="text-primary gap-1">
            View Details <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, skill or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedCandidates.length >= 2 && (
          <Button className="btn-gradient gap-2" onClick={handleCompare}>
            <ArrowRight className="h-4 w-4" />
            Compare Selected ({selectedCandidates.length})
          </Button>
        )}
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by Match Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Sort by Match Score</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="date">Sort by Date</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border border-border rounded-lg overflow-hidden">
          {["All", "Shortlisted", "Pending"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter.toLowerCase() === "all" ? "all" : filter)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                (statusFilter === "all" && filter === "All") ||
                statusFilter === filter
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox />
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Candidate
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Match
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Summary
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedCandidates.includes(candidate.id)}
                    onCheckedChange={() => toggleCandidate(candidate.id)}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {candidate.initials}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <ScoreBar score={candidate.weightedScore} level={candidate.scoreLevel} />
                </td>
                <td className="px-4 py-4 max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {candidate.summary}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={candidate.status} recommendedAction={candidate.recommendedAction} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {candidate.status !== "Rejected" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/candidates/${candidate.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {candidate.status === "Rejected" ? (
                      <Button variant="outline" size="sm" className="gap-1">
                        <Undo2 className="h-3 w-3" />
                        Undo
                      </Button>
                    ) : candidate.status === "Shortlisted" ? (
                      <Button variant="outline" size="sm" className="gap-1" disabled>
                        <Check className="h-3 w-3" />
                        Added
                      </Button>
                    ) : (
                      <Button className="btn-gradient h-8 text-xs gap-1">
                        <Check className="h-3 w-3" />
                        Shortlist
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <strong>1-{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> candidates
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
