import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, MessageCircle, Mail, Phone, MapPin, Linkedin, Calendar, Clock, ChevronDown, ChevronUp, Check, X, AlertTriangle, ArrowLeft, Sparkles, RefreshCw, Send, ExternalLink, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { parseExperienceFromText, parseEducationFromText, calculateOverallFit } from "@/lib/parseResumeText";

export default function CandidateDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    candidates,
    updateCandidate
  } = useApp();
  const candidate = candidates.find(c => c.id === id) || candidates[0];
  const [skillGapOpen, setSkillGapOpen] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleDuration, setScheduleDuration] = useState("45");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successType, setSuccessType] = useState<"interview" | "rejection">("interview");
  const [newNote, setNewNote] = useState("");
  const [rejectionEmailContent, setRejectionEmailContent] = useState(candidate.emailDrafts?.rejection_message || `Dear ${candidate.name},\n\nThank you for your interest in this position. After careful consideration, we have decided to move forward with other candidates.\n\nBest regards,\nRecruit-AI Team`);
  const [scheduleErrors, setScheduleErrors] = useState<{
    date?: string;
    time?: string;
  }>({});
  const [isScheduling, setIsScheduling] = useState(false);
  
  const validateSchedule = () => {
    const errors: {
      date?: string;
      time?: string;
    } = {};
    if (!scheduleDate) {
      errors.date = "Please select a date";
    }
    if (!scheduleTime) {
      errors.time = "Please select a time";
    }
    setScheduleErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleScheduleInterview = async () => {
    if (!validateSchedule()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsScheduling(true);
    
    // Build email content
    const candidateEmail = candidate.email || "agrawalshashank003@gmail.com";
    const candidateName = candidate.name;
    const interviewDate = scheduleDate;
    const interviewTime = scheduleTime;
    const duration = `${scheduleDuration} minutes`;
    
    const emailContent = `Hi ${candidateName},

We are excited to invite you for an interview on ${interviewDate} at ${interviewTime} (for ${duration}). A calendar invite will follow this email.

Best,
Recruit-AI Team`;

    try {
      const response = await fetch("https://shashankagra03.app.n8n.cloud/webhook/98777b71-7cc3-4e8b-8fe7-0e606a457b91", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidate_email: candidateEmail,
          candidate_name: candidateName,
          interview_date: interviewDate,
          interview_time: interviewTime,
          duration: duration,
          email_content: emailContent
        }),
      });

      if (!response.ok) {
        throw new Error("Webhook request failed");
      }

      setSuccessType("interview");
      setShowSuccessModal(true);
      toast({
        title: "Interview Scheduled!",
        description: `Interview invitation sent to ${candidate.name}.`
      });
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };
  const handleReject = () => {
    setSuccessType("rejection");
    setShowSuccessModal(true);
    toast({
      title: "Rejection Email Sent",
      description: `${candidate.name} has been notified.`
    });
  };
  const skillMatchPercent = Math.round(candidate.skillGaps.filter(s => s.status === "Fully Met").length / candidate.skillGaps.length * 100);
  const overallFit = calculateOverallFit(candidate.skillGaps);
  
  // Parse experience and education from raw resume text or use fallback
  const parsedExperience = parseExperienceFromText(candidate.rawResumeText);
  const parsedEducation = parseEducationFromText(candidate.rawResumeText);
  
  // Fallback experience data when parsing doesn't find structured data
  const fallbackExperience = [
    { company: "Choice Finserv Pvt Ltd", role: "Assistant Product IT Manager", duration: "03/2023 to Present" },
    { company: "Broomees India Pvt. Ltd.", role: "Full Stack Developer", duration: "09/2022 to 01/2023" }
  ];
  
  // Fallback education data when parsing doesn't find structured data
  const fallbackEducation = [
    { degree: "Product Management & Agentic AI", institution: "IIT Patna", duration: "05/2025 – 11/2025" },
    { degree: "B. Tech. (CSE)", institution: "GLA University Mathura", duration: "08/2018 – 05/2022" }
  ];
  
  // Use parsed data if available, otherwise use fallback
  const hasExperienceData = parsedExperience.length > 0;
  const hasEducationData = parsedEducation.length > 0;
  
  return <div className="min-h-screen bg-background">
      {/* Sub-header */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/candidates" className="text-muted-foreground hover:text-foreground">
            Candidates
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/candidates" className="text-muted-foreground hover:text-foreground">
            Designers
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-primary">{candidate.name}</span>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to list
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card-elevated p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
                {candidate.initials}
              </div>
              <h2 className="text-xl font-bold text-foreground">{candidate.name}</h2>
              <p className="text-muted-foreground">{candidate.role}</p>
              
              <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {candidate.location}
              </div>
              <p className="text-sm text-muted-foreground mt-1">8 Years Experience</p>

              <div className="flex flex-col gap-2 mt-6">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Resume
                </Button>
                <Button variant="outline" className="w-full gap-2 text-success border-success/30 hover:bg-success/10">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Reminder
                </Button>
              </div>

              <div className="flex justify-center gap-3 mt-4">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Skills */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-3">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                <Badge variant="outline" className="text-muted-foreground">+4 more</Badge>
              </div>
            </div>

            {/* Contact */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {candidate.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Experience & Education Section - Placed above AI Match */}
            <div className="card-elevated p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Experience
                  </h3>
                  {hasExperienceData ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {parsedExperience.map((exp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{exp.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {fallbackExperience.map((exp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>
                            <span className="font-medium text-foreground">{exp.company}</span>
                            {" "}({exp.role}) — {exp.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {/* Education */}
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Education
                  </h3>
                  {hasEducationData ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {parsedEducation.map((edu, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{edu.text}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {fallbackEducation.map((edu, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>
                            <span className="font-medium text-foreground">{edu.degree}</span>
                            {" "}— {edu.institution} ({edu.duration})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Status Actions Bar */}
            <div className="card-elevated p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Current Status: </span>
                  <span className="font-medium">{candidate.status}</span>
                  <span className="text-sm text-muted-foreground ml-2">Applied 3 days ago via LinkedIn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Reject & Email
                  </Button>
                  <Button variant="outline" size="sm">Hold</Button>
                  <Button className="btn-gradient" size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    Shortlist & Schedule
                  </Button>
                </div>
              </div>
            </div>

            {/* Schedule Interview Section */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Schedule Interview
                </h3>
                <Button variant="link" className="text-muted-foreground text-sm p-0">
                  Draft Mode
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Date *</label>
                  <Input type="date" value={scheduleDate} onChange={e => {
                  setScheduleDate(e.target.value);
                  setScheduleErrors(prev => ({
                    ...prev,
                    date: undefined
                  }));
                }} className={scheduleErrors.date ? "border-destructive" : ""} />
                  {scheduleErrors.date && <p className="text-xs text-destructive mt-1">{scheduleErrors.date}</p>}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Time *</label>
                  <Input type="time" value={scheduleTime} onChange={e => {
                  setScheduleTime(e.target.value);
                  setScheduleErrors(prev => ({
                    ...prev,
                    time: undefined
                  }));
                }} className={scheduleErrors.time ? "border-destructive" : ""} />
                  {scheduleErrors.time && <p className="text-xs text-destructive mt-1">{scheduleErrors.time}</p>}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Duration</label>
                  <Select value={scheduleDuration} onValueChange={setScheduleDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="45">45 Minutes</SelectItem>
                      <SelectItem value="60">60 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">EMAIL PREVIEW</span>
                  <Button variant="link" className="text-primary text-sm p-0">Edit Template</Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>"Hi {candidate.name},</p>
                  <p className="mt-2">We are excited to invite you for an interview on <strong className="text-foreground">{scheduleDate || 'TBD'} at {scheduleTime || 'TBD'}</strong>. A calendar invite will follow this email.</p>
                  <p className="mt-2">Best,<br />Recruit-AI Team"</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  Share via WhatsApp
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={isScheduling}>Cancel</Button>
                  <Button className="btn-gradient gap-2" onClick={handleScheduleInterview} disabled={isScheduling}>
                    {isScheduling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Schedule Interview & Email Candidate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Reject Application Section with AI-Generated Email */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <X className="h-4 w-4 text-destructive" />
                Reject Application
              </h3>

              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-1 block">Rejection Reason</label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience mismatch</SelectItem>
                    <SelectItem value="skills">Skills gap</SelectItem>
                    <SelectItem value="salary">Salary expectations</SelectItem>
                    <SelectItem value="culture">Culture fit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">REJECTION EMAIL (AI-GENERATED)</span>
                  <Badge variant="outline" className="text-xs">From n8n Analysis</Badge>
                </div>
                <Textarea value={rejectionEmailContent} onChange={e => setRejectionEmailContent(e.target.value)} className="min-h-[120px] text-sm bg-background" placeholder="Rejection email content..." />
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  Share via WhatsApp
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive" className="gap-2" onClick={handleReject}>
                    <X className="h-4 w-4" />
                    Reject & Send Rejection Email
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Recruit-AI Analysis
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">BASE: <strong className="text-foreground">{candidate.baseScore}%</strong></span>
                  <span className="text-muted-foreground">WEIGHTED: <strong className="text-primary">{candidate.weightedScore}%</strong></span>
                  
                  {candidate.recommendedAction && <Badge className={cn("text-xs", candidate.recommendedAction === "Interview" && "bg-success/10 text-success border-success/30", candidate.recommendedAction === "Reject" && "bg-destructive/10 text-destructive border-destructive/30", candidate.recommendedAction === "Hold" && "bg-warning/10 text-warning border-warning/30")} variant="outline">
                      {candidate.recommendedAction}
                    </Badge>}
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {candidate.summary || "No AI summary available for this candidate."}
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-success flex items-center gap-2 mb-3">
                    <Check className="h-4 w-4" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5" />
                      Proven leadership in agile teams managing 3+ juniors at Stripe.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5" />
                      Strong prototyping skills (Figma, Principle) demonstrated in portfolio.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5" />
                      Consistent tenure with previous employers (avg 3.5 years).
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-warning flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Potential Gaps
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      Limited recent experience with React/front-end code.
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      Salary expectation is slightly above budget range.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Skills Gap Analysis */}
            <Collapsible open={skillGapOpen} onOpenChange={setSkillGapOpen}>
              <div className="card-elevated p-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    📊 Skills Gap Analysis
                  </h3>
                  {skillGapOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide">
                        <th className="pb-3">Skill</th>
                        <th className="pb-3">Candidate Match Status</th>
                        <th className="pb-3">Brief Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {candidate.skillGaps.map((gap, index) => <tr key={index}>
                          <td className="py-3">
                            <div>
                              <span className="font-medium">{gap.skill}</span>
                              <Badge variant="outline" className={cn("ml-2 text-xs", gap.priority === "Essential" && "border-destructive/50 text-destructive", gap.priority === "Preferred" && "border-primary/50 text-primary", gap.priority === "Nice-to-have" && "border-muted-foreground")}>
                                {gap.priority}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={cn("flex items-center gap-1 text-sm", gap.status === "Fully Met" && "text-success", gap.status === "Partial Match" && "text-warning", gap.status === "Missing" && "text-destructive")}>
                              {gap.status === "Fully Met" && <Check className="h-4 w-4" />}
                              {gap.status === "Partial Match" && <AlertTriangle className="h-4 w-4" />}
                              {gap.status === "Missing" && <X className="h-4 w-4" />}
                              {gap.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">{gap.note}</td>
                        </tr>)}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Skill Match</span>
                        <p className="text-2xl font-bold text-foreground">{skillMatchPercent}%</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Overall Fit</span>
                        <p className={cn(
                          "text-2xl font-bold",
                          overallFit === "High" && "text-success",
                          overallFit === "Moderate" && "text-warning",
                          overallFit === "Low" && "text-destructive"
                        )}>{overallFit}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Re-calculate Analysis
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>


            {/* Notes & Messages */}
            <div className="card-elevated p-6">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                💬 Notes & Messages
              </h3>

              <div className="space-y-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    JD
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">John Doe</span>
                      <span className="text-xs text-muted-foreground">Yesterday at 2:30 PM</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @PM check technical fit. The React experience seems light, but the design system work is stellar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-xs font-medium text-success">
                    You
                  </div>
                  <div className="flex-1 bg-primary/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">You</span>
                      <span className="text-xs text-muted-foreground">Today at 9:15 AM</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Agreed. The AI summary highlights her ability to learn quickly. Let's proceed with the interview to gauge her interest in learning more FE.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Input placeholder="Add a private note or use @ to mention teammates..." value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1" />
                <Button className="btn-gradient" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center py-6">
            <div className={successType === "interview" ? "w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-success/10" : "w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10"}>
              <Check className={successType === "interview" ? "h-8 w-8 text-success" : "h-8 w-8 text-primary"} />
            </div>
            
            <DialogTitle className="text-xl mb-2">
              {successType === "interview" ? "Interview Scheduled!" : "Rejection Email Sent"}
            </DialogTitle>
            
            <p className="text-muted-foreground mb-6">
              {successType === "interview" ? `An email invitation has been automatically sent to ${candidate.name}.` : "The candidate has been successfully notified via email regarding the status of their application."}
            </p>

            <Button variant="outline" className="w-full mb-3 gap-2 text-success border-success/30 hover:bg-success/10">
              <MessageCircle className="h-4 w-4" />
              {successType === "interview" ? "Send WhatsApp Reminder" : "Notify via WhatsApp"}
            </Button>

            <Button className="w-full btn-gradient" onClick={() => {
            setShowSuccessModal(false);
            navigate("/candidates");
          }}>
              {successType === "interview" ? "Back to Dashboard" : "Return to Candidate List"}
            </Button>

            <Button variant="link" className="text-muted-foreground text-sm mt-2" onClick={() => setShowSuccessModal(false)}>
              ↩ Undo this action
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}