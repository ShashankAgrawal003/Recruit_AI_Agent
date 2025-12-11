import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { mockCandidates, type Candidate } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { ResumeUploader } from "@/components/ResumeUploader";

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

function StatusBadge({ status }: { status: Candidate["status"] }) {
  const styles = {
    "Pending Review": "status-pending",
    Shortlisted: "status-shortlisted",
    Rejected: "status-rejected",
    Hold: "status-paused",
  }[status];

  return <span className={cn("status-badge", styles)}>{status}</span>;
}

export default function Candidates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  // JD text for the active job - in a real app this would come from context/API
  const activeJdText = `We are looking for a Senior React Engineer with 5+ years of experience in React, TypeScript, and modern frontend development. Experience with Node.js, GraphQL, and cloud services is preferred.`;
  
  const {
    files,
    isUploading,
    addFiles,
    removeFile,
    clearAll,
    uploadFiles,
    retryFile,
    cancelUpload,
  } = useResumeUpload(activeJdText);

  const filteredCandidates = mockCandidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "Shortlisted" && c.status === "Shortlisted") ||
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
            50 Processed
          </Badge>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            12 Shortlisted
          </Badge>
        </div>
      </div>

      {/* Upload Section with n8n Webhook Integration */}
      <ResumeUploader
        files={files}
        isUploading={isUploading}
        onFilesSelected={addFiles}
        onRemoveFile={removeFile}
        onRetryFile={retryFile}
        onUpload={uploadFiles}
        onCancelUpload={cancelUpload}
        onClearAll={clearAll}
      />

      {/* Active JD Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary border-0">ACTIVE JD</Badge>
          <span className="font-medium">Senior React Engineer</span>
          <span className="text-sm text-muted-foreground">ID: RE-2024-003</span>
        </div>
        <Button variant="link" className="text-primary gap-1">
          View Details <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

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
                  <StatusBadge status={candidate.status} />
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
            Showing <strong>1-{filteredCandidates.length}</strong> of <strong>50</strong> candidates
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
