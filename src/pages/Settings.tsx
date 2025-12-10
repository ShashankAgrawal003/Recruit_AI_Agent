import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Lock,
  Users,
  Puzzle,
  LogOut,
  Mail,
  Phone,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const sidebarLinks = [
  { icon: User, label: "My Profile", id: "profile" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Lock, label: "Password & Security", id: "security" },
  { icon: Users, label: "Team Members", id: "team" },
  { icon: Puzzle, label: "Integrations", id: "integrations" },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [firstName, setFirstName] = useState("Sarah");
  const [lastName, setLastName] = useState("Jenning");
  const [jobTitle, setJobTitle] = useState("Co-founder & CTO");
  const [department, setDepartment] = useState("Engineering");
  const [email] = useState("sarah@techflow.inc");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [timezone, setTimezone] = useState("pst");
  const [language, setLanguage] = useState("en-us");

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Settings Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <p className="text-sm text-muted-foreground mt-1">TechFlow Inc.</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveSection(link.id)}
              className={cn(
                "sidebar-link w-full text-left",
                activeSection === link.id && "sidebar-link-active"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            to="/login"
            className="sidebar-link w-full text-left text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and account preferences.
            </p>
          </div>

          {/* Profile Card */}
          <div className="card-elevated p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl font-bold text-primary ring-4 ring-warning/20">
                  SJ
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {firstName} {lastName}
                </h2>
                <p className="text-primary">{jobTitle}</p>
              </div>
              <div className="flex gap-2">
                <Button className="btn-gradient gap-2">
                  <Camera className="h-4 w-4" />
                  Upload New Photo
                </Button>
                <Button variant="outline">Remove</Button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card-elevated p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact & Preferences */}
          <div className="card-elevated p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Contact & Preferences</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="pl-10 bg-muted/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact your admin to change your email.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pst">(GMT-08:00) Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="mst">(GMT-07:00) Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="cst">(GMT-06:00) Central Time (US & Canada)</SelectItem>
                    <SelectItem value="est">(GMT-05:00) Eastern Time (US & Canada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-us">English (US)</SelectItem>
                    <SelectItem value="en-gb">English (UK)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button className="btn-gradient" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
