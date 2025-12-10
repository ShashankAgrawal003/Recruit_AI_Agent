import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, ArrowLeft, Check, Calendar, Archive } from "lucide-react";
import { mockCandidates } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ids = searchParams.get("ids")?.split(",") || [];
  
  const candidates = ids.length > 0
    ? mockCandidates.filter((c) => ids.includes(c.id))
    : mockCandidates.slice(0, 3);

  const topMatchIndex = candidates.reduce(
    (maxIdx, c, idx, arr) => c.weightedScore > arr[maxIdx].weightedScore ? idx : maxIdx,
    0
  );

  const handleSchedule = (name: string) => {
    toast({
      title: "Interview Scheduling",
      description: `Opening scheduler for ${name}...`,
    });
    navigate(`/candidates/${candidates.find(c => c.name === name)?.id}`);
  };

  const parameters = [
    {
      label: "AI Match Score",
      getValue: (c: typeof candidates[0]) => c.weightedScore,
      render: (c: typeof candidates[0], isTop: boolean) => (
        <span className={cn(
          "text-2xl font-bold px-3 py-1 rounded-full",
          isTop ? "text-success bg-success/10" : c.scoreLevel === "Good" ? "text-foreground" : "text-warning"
        )}>
          {c.weightedScore}%
        </span>
      ),
      compare: "higher",
    },
    {
      label: "Experience",
      getValue: (c: typeof candidates[0]) => parseInt(c.experience[0]?.period.split(" - ")[0] || "0"),
      render: (c: typeof candidates[0]) => <span className="font-medium">{8 - candidates.indexOf(c)} Years</span>,
      compare: "higher",
    },
    {
      label: "Salary Expectation",
      getValue: (c: typeof candidates[0]) => parseInt(c.salaryExpectation.replace(/[^0-9]/g, "")),
      render: (c: typeof candidates[0], isTop: boolean, value: number) => {
        const isHighest = value === Math.max(...candidates.map(cc => parseInt(cc.salaryExpectation.replace(/[^0-9]/g, ""))));
        return (
          <span className={cn(
            "px-2 py-0.5 rounded text-sm font-medium",
            isHighest ? "text-destructive bg-destructive/10" : "text-foreground"
          )}>
            {c.salaryExpectation}
          </span>
        );
      },
      compare: "lower",
    },
    {
      label: "Availability",
      getValue: (c: typeof candidates[0]) => c.availability === "Immediate" ? 0 : c.availability === "2 Weeks" ? 2 : 4,
      render: (c: typeof candidates[0], isTop: boolean) => (
        <span className={cn(
          "flex items-center gap-1",
          c.availability === "Immediate" && "text-success"
        )}>
          {c.availability === "Immediate" && <Check className="h-4 w-4" />}
          {c.availability}
        </span>
      ),
      compare: "lower",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/candidates" className="text-muted-foreground hover:text-foreground">
              Candidates
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Senior Frontend Engineer</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">Compare</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/candidates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <Button className="btn-gradient gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Candidate Comparison</h1>
          <p className="text-muted-foreground mt-1">
            Comparing {candidates.length} shortlisted candidates based on AI screening and initial assessments.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="card-elevated overflow-hidden">
          {/* Candidate Headers */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
            <div className="p-4 bg-muted/30" />
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className="p-6 text-center border-l border-border relative">
                {index === topMatchIndex && (
                  <Badge className="absolute top-2 left-1/2 -translate-x-1/2 bg-success text-success-foreground">
                    TOP MATCH
                  </Badge>
                )}
                <div className={cn(
                  "w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold",
                  index === topMatchIndex 
                    ? "bg-gradient-to-br from-success/20 to-success/5 text-success ring-2 ring-success/30" 
                    : "bg-primary/10 text-primary"
                )}>
                  {candidate.initials}
                </div>
                <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
                <div className={cn(
                  "h-1 w-full mt-4 rounded-full",
                  index === topMatchIndex ? "bg-success" : index === 1 ? "bg-primary" : "bg-warning"
                )} />
              </div>
            ))}
          </div>

          {/* Parameters Label */}
          <div className="grid border-b border-border bg-muted/30" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
            <div className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Parameters
            </div>
            {candidates.map((c) => (
              <div key={c.id} className="p-4 border-l border-border" />
            ))}
          </div>

          {/* Parameter Rows */}
          {parameters.map((param, paramIndex) => {
            const values = candidates.map((c) => param.getValue(c));
            const bestValue = param.compare === "higher" ? Math.max(...values) : Math.min(...values);
            
            return (
              <div
                key={param.label}
                className={cn(
                  "grid border-b border-border",
                  paramIndex % 2 === 0 ? "bg-muted/20" : ""
                )}
                style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}
              >
                <div className="p-4 flex items-center text-sm font-medium text-muted-foreground">
                  {param.label}
                </div>
                {candidates.map((candidate, index) => {
                  const value = param.getValue(candidate);
                  const isTop = value === bestValue;
                  return (
                    <div
                      key={candidate.id}
                      className={cn(
                        "p-4 flex items-center justify-center border-l border-border",
                        isTop && "bg-success/5"
                      )}
                    >
                      {param.render(candidate, isTop, value)}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Key Strengths */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
            <div className="p-4 flex items-start text-sm font-medium text-muted-foreground">
              Key Strengths
            </div>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-4 border-l border-border">
                <div className="flex flex-wrap gap-2 justify-center">
                  {candidate.strengths.map((strength) => (
                    <Badge key={strength} variant="outline" className="border-success/30 text-success">
                      {strength}
                    </Badge>
                  ))}
                  {candidate.strengths.length === 0 && (
                    <span className="text-sm text-muted-foreground">None listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Potential Flags */}
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
            <div className="p-4 flex items-start text-sm font-medium text-muted-foreground">
              Potential Flags
            </div>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-4 border-l border-border">
                <div className="flex flex-wrap gap-2 justify-center">
                  {candidate.flags.map((flag) => (
                    <Badge key={flag} variant="outline" className="border-warning/30 text-warning">
                      {flag}
                    </Badge>
                  ))}
                  {candidate.flags.length === 0 && (
                    <span className="text-sm text-success">None detected</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Team Notes */}
          <div className="grid border-b border-border bg-muted/20" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
            <div className="p-4 flex items-start text-sm font-medium text-muted-foreground">
              💬 Team Notes
            </div>
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className="p-4 border-l border-border">
                {index === 0 ? (
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                        JD
                      </div>
                      <span className="text-xs font-medium">@CTO</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Strongest technical fit. Let's move fast.</p>
                    <Input placeholder="Add note..." className="mt-2 h-7 text-xs" />
                  </div>
                ) : index === 2 ? (
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center text-[10px] font-medium text-warning">
                        AM
                      </div>
                      <span className="text-xs font-medium">@Product</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Concerned about timezone overlap.</p>
                    <Input placeholder="Add note..." className="mt-2 h-7 text-xs" />
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground italic mb-2">No notes yet</p>
                    <Input placeholder="Add note..." className="h-7 text-xs" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${candidates.length}, 1fr)` }}>
            <div className="p-4" />
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className="p-6 border-l border-border flex flex-col items-center gap-3">
                <Button
                  className={cn(
                    "w-full gap-2",
                    index === topMatchIndex ? "btn-gradient" : ""
                  )}
                  variant={index === topMatchIndex ? "default" : "outline"}
                  onClick={() => handleSchedule(candidate.name)}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </Button>
                <Button variant="link" className="text-muted-foreground text-sm">
                  Pass / Archive
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
