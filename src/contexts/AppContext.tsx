import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { mockJobs, mockCandidates, type Job, type Candidate } from "@/lib/mockData";

interface AppContextType {
  jobs: Job[];
  candidates: Candidate[];
  addJob: (job: Omit<Job, "id" | "createdAt">) => Job;
  addCandidate: (candidate: Omit<Candidate, "id">) => Candidate;
  updateJob: (id: string, updates: Partial<Job>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  getJobById: (id: string) => Job | undefined;
  getCandidateById: (id: string) => Candidate | undefined;
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;
  activeJobJd: { fileName: string; content: string } | null;
  setActiveJobJd: (jd: { fileName: string; content: string } | null) => void;
  kpis: {
    activeRoles: number;
    totalApplicants: number;
    shortlisted: number;
    interviewScheduled: number;
    selected: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobJd, setActiveJobJd] = useState<{ fileName: string; content: string } | null>(null);

  const addJob = useCallback((jobData: Omit<Job, "id" | "createdAt">) => {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  }, []);

  const addCandidate = useCallback((candidateData: Omit<Candidate, "id">) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: `candidate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setCandidates((prev) => [newCandidate, ...prev]);
    return newCandidate;
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job))
    );
  }, []);

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const getJobById = useCallback((id: string) => {
    return jobs.find((job) => job.id === id);
  }, [jobs]);

  const getCandidateById = useCallback((id: string) => {
    return candidates.find((c) => c.id === id);
  }, [candidates]);

  // Calculate KPIs based on actual data
  const kpis = {
    // Active roles: count roles with hasJD=true or status="Active"
    activeRoles: jobs.filter((j) => j.hasJD || j.status === "Active").length,
    // Total applicants: count all candidates
    totalApplicants: candidates.length,
    // Shortlisted: candidates with recommendedAction="Interview" or status includes interview-related
    shortlisted: candidates.filter((c) => 
      c.recommendedAction === "Interview" || 
      c.status === "Shortlisted" || 
      c.status === "Interview"
    ).length,
    // Interview scheduled: candidates with an interviewDate set
    interviewScheduled: candidates.filter((c) => c.interviewDate).length,
    // Selected: candidates with status="Selected"
    selected: candidates.filter((c) => c.status === "Selected").length,
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        candidates,
        addJob,
        addCandidate,
        updateJob,
        updateCandidate,
        getJobById,
        getCandidateById,
        activeJobId,
        setActiveJobId,
        activeJobJd,
        setActiveJobJd,
        kpis,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
