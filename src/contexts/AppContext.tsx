import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { mockJobs, mockCandidates, type Job, type Candidate } from "@/lib/mockData";

interface AppContextType {
  jobs: Job[];
  candidates: Candidate[];
  addJob: (job: Omit<Job, "id" | "createdAt">) => Job;
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

  // Calculate KPIs
  const kpis = {
    activeRoles: jobs.filter((j) => j.status === "Active").length,
    totalApplicants: candidates.length,
    shortlisted: candidates.filter((c) => c.status === "Shortlisted").length,
    interviewScheduled: 3, // Mock value
    selected: 1, // Mock value
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        candidates,
        addJob,
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
