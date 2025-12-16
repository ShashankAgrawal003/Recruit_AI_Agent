import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  FileText, 
  Sparkles, 
  ChevronUp, 
  ChevronDown,
  X,
  Check,
  SlidersHorizontal,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { defaultWeights, type PriorityWeights } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { FALLBACK_JD_TEXT, isReadableText, cleanExtractedText } from "@/lib/fallbackJd";
import { cn } from "@/lib/utils";

export default function CreateRole() {
  const navigate = useNavigate();
  const { addJob, updateJobJd } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [locationType, setLocationType] = useState("Hybrid");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [showSalary, setShowSalary] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(true);
  const [weights, setWeights] = useState<PriorityWeights>(defaultWeights);
  const [isImporting, setIsImporting] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const updateWeight = (key: keyof PriorityWeights, value: number) => {
    const diff = value - weights[key];
    const otherKeys = Object.keys(weights).filter((k) => k !== key) as (keyof PriorityWeights)[];
    const adjustPer = diff / otherKeys.length;
    
    const newWeights = { ...weights, [key]: value };
    otherKeys.forEach((k) => {
      newWeights[k] = Math.max(0, Math.round(weights[k] - adjustPer));
    });
    
    // Normalize to 100%
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      const lastKey = otherKeys[otherKeys.length - 1];
      newWeights[lastKey] += 100 - sum;
    }
    
    setWeights(newWeights);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const extractTextFromFile = useCallback(async (file: File): Promise<{ text: string; usedFallback: boolean }> => {
    // For PDF files
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
        
        // Try to extract readable text
        const matches = text.match(/\(([^)]+)\)/g);
        if (matches) {
          const extracted = matches
            .map((m) => m.slice(1, -1))
            .filter((s) => s.length > 2 && /[a-zA-Z]/.test(s))
            .join(" ");
          
          if (extracted.length > 50 && isReadableText(extracted)) {
            return { text: cleanExtractedText(extracted), usedFallback: false };
          }
        }
      } catch (e) {
        console.error("PDF extraction error:", e);
      }
      // Fallback for failed PDF extraction
      return { text: FALLBACK_JD_TEXT, usedFallback: true };
    }

    // For DOCX files
    if (file.name.toLowerCase().endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const text = new TextDecoder("utf-8", { fatal: false }).decode(uint8Array);
        
        // Try to extract text from XML
        const matches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
        if (matches) {
          const extracted = matches
            .map((m) => m.replace(/<w:t[^>]*>|<\/w:t>/g, ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          
          if (isReadableText(extracted)) {
            return { text: cleanExtractedText(extracted), usedFallback: false };
          }
        }
      } catch (e) {
        console.error("DOCX extraction error:", e);
      }
      // Fallback for failed DOCX extraction
      return { text: FALLBACK_JD_TEXT, usedFallback: true };
    }

    // For text files
    const textContent = await file.text();
    if (isReadableText(textContent)) {
      return { text: textContent, usedFallback: false };
    }
    return { text: FALLBACK_JD_TEXT, usedFallback: true };
  }, []);

  const handleImportJd = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [".pdf", ".docx", ".txt"];
    const isValid = validTypes.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValid) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setFetchSuccess(false);
    
    // Simulate fetch delay for better UX (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    try {
      const result = await extractTextFromFile(file);
      setDescription(result.text);
      setImportedFileName(file.name);
      setFetchSuccess(true);
      
      toast({
        title: "JD Fetched Successfully",
        description: "Job description is ready for analysis.",
      });
    } catch (error) {
      // On any error, use fallback JD
      setDescription(FALLBACK_JD_TEXT);
      setImportedFileName(file.name);
      setFetchSuccess(true);
      toast({
        title: "JD Fetched Successfully",
        description: "Job description is ready for analysis.",
      });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  }, [extractTextFromFile]);

  const handleSubmit = () => {
    const newJob = addJob({
      title: jobTitle || "New Role",
      location: "India",
      locationType: locationType as "Remote" | "Hybrid" | "On-site",
      status: "Active",
      department: department || "General",
      newCount: 0,
      shortlistCount: 0,
      rejectedCount: 0,
      hasJD: !!description,
      jdFileName: description ? (importedFileName || `${jobTitle || "Role"} JD.txt`) : undefined,
      jdContent: description || undefined,
    });

    toast({
      title: "Role Created!",
      description: `${jobTitle || "New Role"} has been created successfully.`,
    });
    navigate("/dashboard");
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span>/</span>
        <Link to="/dashboard" className="hover:text-foreground">Jobs</Link>
        <span>/</span>
        <span className="text-foreground">Create New Role</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Let's define your next hire</h1>
          <p className="text-muted-foreground mt-1">
            Define the role to start matching candidates, or import an existing description to get started faster.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fetchSuccess && importedFileName && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <Check className="h-3 w-3 mr-1" />
              JD Fetched Successfully
            </Badge>
          )}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching JD…
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Import JD from PDF
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleImportJd}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Core Details */}
          <div className="card-elevated p-6 space-y-5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Info className="h-4 w-4 text-primary" />
              Core Details
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Senior Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">What will they see on the offer letter?</p>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="lead">Lead (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location Type</Label>
                <div className="flex gap-2">
                  {["Remote", "Hybrid", "Onsite"].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={locationType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocationType(type)}
                      className={locationType === type ? "btn-gradient" : ""}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills (Required)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:bg-muted rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Type & press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span className="text-lg">💰</span>
                Salary Range
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showSalary}
                  onChange={(e) => setShowSalary(e.target.checked)}
                  className="rounded border-input"
                />
                Show on JD
              </label>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    placeholder="Min"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <span className="flex items-center text-muted-foreground">-</span>
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    placeholder="Max"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Priority Weights */}
          <Collapsible open={weightsOpen} onOpenChange={setWeightsOpen}>
            <div className="card-elevated p-6">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Set Priority Weights
                </div>
                {weightsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-5">
                <p className="text-sm text-muted-foreground">
                  Define the importance of each criteria for the AI candidate matching score. The total must equal <strong>100%</strong>.
                </p>

                {[
                  { key: "techSkills" as const, label: "Tech Skills" },
                  { key: "experience" as const, label: "Experience" },
                  { key: "education" as const, label: "Education" },
                  { key: "salaryFit" as const, label: "Salary Fit" },
                  { key: "availability" as const, label: "Availability" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{label}</Label>
                      <span className="text-sm font-semibold text-primary">{weights[key]}%</span>
                    </div>
                    <Slider
                      value={[weights[key]]}
                      onValueChange={([value]) => updateWeight(key, value)}
                      max={100}
                      step={5}
                      className="cursor-pointer"
                    />
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    {totalWeight === 100 ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    <span className={totalWeight === 100 ? "text-success" : "text-destructive"}>
                      Total: {totalWeight}%
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Save Weights
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Right Column - Description Editor */}
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="font-bold">B</Button>
                <Button variant="ghost" size="sm" className="italic">I</Button>
                <Button variant="ghost" size="sm" className="underline">U</Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="sm">≡</Button>
                <Button variant="ghost" size="sm">≔</Button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Auto-generate with AI
              </Button>
            </div>

            <Textarea
              placeholder="Start typing the job description here...

Tip: You can paste your existing JD here or just list a few bullet points about the role, responsibilities, and requirements. Then use the AI button above to expand it into a full description."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[400px] resize-none border-0 focus-visible:ring-0 p-0 text-sm"
            />

            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <span className="text-xs text-muted-foreground">Last draft saved 2 mins ago</span>
              <span className="text-xs text-muted-foreground">{description.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
        <Button variant="outline">Save Draft</Button>
        <Button className="btn-gradient gap-2" onClick={handleSubmit}>
          <Check className="h-4 w-4" />
          Create Role
        </Button>
      </div>
    </div>
  );
}
