import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Search, MapPin, Globe, FileText, MoreHorizontal, Briefcase, Users, UserCheck, Calendar, Award } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/mockData";

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="card-elevated p-4 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const statusClass = {
    Active: "status-active",
    Paused: "status-paused",
    Draft: "status-draft",
  }[job.status];

  return (
    <div className="card-elevated p-5 hover:shadow-elevated transition-all animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-semibold text-foreground truncate max-w-[200px]">
                  {job.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{job.title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {!job.hasJD && (
            <p className="text-xs text-muted-foreground mt-0.5">Upload JD to start matching</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            {job.locationType === 'Remote' ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.locationType}</span>
          </div>
        </div>
        <span className={cn("status-badge", statusClass)}>{job.status}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{job.newCount}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">New</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{job.shortlistCount}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Shortlist</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">{job.rejectedCount}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Rejected</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(3, job.newCount + job.shortlistCount) }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-xs font-medium text-primary"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {job.newCount + job.shortlistCount > 3 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
              +{job.newCount + job.shortlistCount - 3}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {job.hasJD ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              <FileText className="h-3 w-3" />
              JD Uploaded
            </span>
          ) : (
            <Button variant="outline" size="sm" className="text-xs h-7">
              Upload JD
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateJobCard() {
  return (
    <Link
      to="/jobs/new"
      className="card-elevated p-5 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[200px] group"
    >
      <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">Create New Role</h3>
      <p className="text-sm text-muted-foreground mt-1">Post a new job and start hiring</p>
    </Link>
  );
}

export default function Dashboard() {
  const { jobs, kpis } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesLocation = locationFilter === "all" || job.locationType === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Open Roles</h1>
          <p className="text-muted-foreground mt-1">
            Manage active listings and track candidate pipelines.
          </p>
        </div>
        <Button asChild className="btn-gradient">
          <Link to="/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Role
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={Briefcase} label="Active Roles" value={kpis.activeRoles} color="bg-primary/10 text-primary" />
        <KpiCard icon={Users} label="Total Applicants" value={kpis.totalApplicants} color="bg-blue-500/10 text-blue-500" />
        <KpiCard icon={UserCheck} label="Shortlisted" value={kpis.shortlisted} color="bg-success/10 text-success" />
        <KpiCard icon={Calendar} label="Interview Scheduled" value={kpis.interviewScheduled} color="bg-warning/10 text-warning" />
        <KpiCard icon={Award} label="Selected" value={kpis.selected} color="bg-purple-500/10 text-purple-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="On-site">On-site</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Link key={job.id} to={`/candidates?job=${job.id}`}>
            <JobCard job={job} />
          </Link>
        ))}
        <CreateJobCard />
      </div>
    </div>
  );
}
