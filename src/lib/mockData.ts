export interface Job {
  id: string;
  title: string;
  location: string;
  locationType: 'Remote' | 'Hybrid' | 'On-site';
  status: 'Active' | 'Paused' | 'Draft';
  department: string;
  newCount: number;
  shortlistCount: number;
  rejectedCount: number;
  hasJD: boolean;
  createdAt: string;
}

export interface EmailDrafts {
  rejection_message: string;
  interview_message?: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  initials: string;
  baseScore: number;
  weightedScore: number;
  scoreLevel: 'High' | 'Good' | 'Low';
  summary: string;
  status: 'Pending Review' | 'Shortlisted' | 'Rejected' | 'Hold' | 'Interview' | 'Selected';
  recommendedAction?: 'Interview' | 'Reject' | 'Hold';
  skills: string[];
  experience: Experience[];
  education: Education[];
  skillGaps: SkillGap[];
  strengths?: string[];
  flags?: string[];
  salaryExpectation?: string;
  availability?: string;
  linkedIn?: string;
  interviewDate?: string;
  emailDrafts?: EmailDrafts;
  resumeFileName?: string;
  rawResumeText?: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}

export interface Education {
  degree: string;
  school: string;
  period: string;
}

export interface SkillGap {
  skill: string;
  priority: 'Essential' | 'Preferred' | 'Nice-to-have';
  status: 'Fully Met' | 'Partial Match' | 'Missing';
  note: string;
}

export interface PriorityWeights {
  techSkills: number;
  experience: number;
  education: number;
  salaryFit: number;
  availability: number;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full Stack Engineer',
    location: 'India',
    locationType: 'Hybrid',
    status: 'Active',
    department: 'Engineering',
    newCount: 12,
    shortlistCount: 3,
    rejectedCount: 45,
    hasJD: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Product Designer',
    location: 'India',
    locationType: 'Hybrid',
    status: 'Active',
    department: 'Design',
    newCount: 5,
    shortlistCount: 1,
    rejectedCount: 12,
    hasJD: true,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Marketing Lead',
    location: 'India',
    locationType: 'Hybrid',
    status: 'Paused',
    department: 'Marketing',
    newCount: 0,
    shortlistCount: 2,
    rejectedCount: 8,
    hasJD: false,
    createdAt: '2024-01-05'
  },
  {
    id: '4',
    title: 'Customer Success Mgr',
    location: 'India',
    locationType: 'Hybrid',
    status: 'Active',
    department: 'Customer Success',
    newCount: 3,
    shortlistCount: 0,
    rejectedCount: 5,
    hasJD: true,
    createdAt: '2024-01-20'
  },
  {
    id: '5',
    title: 'Backend Dev (Go)',
    location: 'India',
    locationType: 'Hybrid',
    status: 'Draft',
    department: 'Engineering',
    newCount: 0,
    shortlistCount: 0,
    rejectedCount: 0,
    hasJD: false,
    createdAt: '2024-01-22'
  }
];

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Senior React Engineer',
    email: 'sarah.jenkins@design.com',
    phone: '+1 (415) 555-0123',
    location: 'San Francisco, CA (Remote)',
    initials: 'SJ',
    baseScore: 85,
    weightedScore: 92,
    scoreLevel: 'High',
    summary: 'Ex-Shopify lead with 7 years of experience. Strong TypeScript & React expertise with proven leadership.',
    status: 'Pending Review',
    recommendedAction: 'Interview',
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems', 'Agile'],
    experience: [
      {
        title: 'Product Designer',
        company: 'Stripe',
        period: '2020 - Present',
        description: 'Led the design of the new checkout experience, increasing conversion by 12%. Managed the design system migration to Figma.',
        tags: ['Payments', 'Design Systems']
      },
      {
        title: 'UX Designer',
        company: 'Dropbox',
        period: '2017 - 2020',
        description: 'Worked on the Paper team to integrate collaborative editing features. Conducted user research for the mobile app redesign.',
        tags: []
      },
      {
        title: 'Junior Designer',
        company: 'Agency XYZ',
        period: '2015 - 2017',
        description: 'Assisted in web design projects for various e-commerce clients. Learned front-end basics.',
        tags: []
      }
    ],
    education: [
      {
        degree: 'BFA Interaction Design',
        school: 'California College of the Arts (CCA)',
        period: '2011 - 2015'
      }
    ],
    skillGaps: [
      { skill: 'Product Strategy', priority: 'Essential', status: 'Fully Met', note: '8+ years leading product direction' },
      { skill: 'Figma / Design Systems', priority: 'Essential', status: 'Fully Met', note: 'Advanced proficiency, Portfolio evidence' },
      { skill: 'React / Frontend', priority: 'Preferred', status: 'Partial Match', note: 'Basic HTML/CSS, minimal React exp' },
      { skill: 'Cloud (AWS/Azure)', priority: 'Nice-to-have', status: 'Missing', note: 'No specific cloud exp listed' }
    ],
    strengths: ['React Expert', 'Team Lead', 'System Design'],
    flags: ['High Salary'],
    salaryExpectation: '$145k',
    availability: 'Immediate',
    linkedIn: 'linkedin.com/in/sarahjenkins',
    emailDrafts: {
      rejection_message: 'Dear Sarah,\n\nThank you for your interest in the Senior React Engineer position. After careful review of your application, we have decided to pursue other candidates whose experience more closely aligns with our current needs.\n\nWe appreciate your time and wish you the best in your job search.\n\nBest regards,\nRecruit-AI Team'
    }
  },
  {
    id: '2',
    name: 'Michael Kim',
    role: 'Backend Developer',
    email: 'michael.kim@email.com',
    phone: '+1 (555) 234-5678',
    location: 'Austin, TX',
    initials: 'MK',
    baseScore: 78,
    weightedScore: 78,
    scoreLevel: 'Good',
    summary: 'Good Python/Django skills, but lacks the specific Node.js requirement. 3 years experience.',
    status: 'Interview',
    recommendedAction: 'Interview',
    interviewDate: '2024-01-25T10:00:00',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    experience: [
      {
        title: 'Backend Developer',
        company: 'TechStartup',
        period: '2021 - Present',
        description: 'Built and maintained REST APIs using Python and Django.',
        tags: ['Python', 'APIs']
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'UT Austin',
        period: '2017 - 2021'
      }
    ],
    skillGaps: [
      { skill: 'Python', priority: 'Essential', status: 'Fully Met', note: '3+ years experience' },
      { skill: 'Node.js', priority: 'Preferred', status: 'Missing', note: 'No Node.js experience listed' },
      { skill: 'Docker', priority: 'Preferred', status: 'Fully Met', note: 'Production experience' }
    ],
    strengths: ['Modern UI', 'Fast Learner'],
    flags: ['Short Tenures', 'Remote Only'],
    salaryExpectation: '$130k',
    availability: '2 Weeks',
    emailDrafts: {
      rejection_message: 'Dear Michael,\n\nThank you for applying. Unfortunately, we have decided to move forward with other candidates.\n\nBest regards,\nRecruit-AI Team'
    }
  },
  {
    id: '3',
    name: 'James Carter',
    role: 'Full Stack Engineer',
    email: 'james.carter@email.com',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    initials: 'JC',
    baseScore: 45,
    weightedScore: 45,
    scoreLevel: 'Low',
    summary: 'Resume formatting issues detected. Skills listed don\'t match job description.',
    status: 'Rejected',
    recommendedAction: 'Reject',
    skills: ['JavaScript', 'HTML', 'CSS'],
    experience: [
      {
        title: 'Junior Developer',
        company: 'Small Agency',
        period: '2022 - Present',
        description: 'Basic web development tasks.',
        tags: []
      }
    ],
    education: [
      {
        degree: 'Bootcamp Certificate',
        school: 'Code Academy',
        period: '2022'
      }
    ],
    skillGaps: [
      { skill: 'React', priority: 'Essential', status: 'Missing', note: 'Only basic JavaScript listed' },
      { skill: 'TypeScript', priority: 'Essential', status: 'Missing', note: 'No TypeScript experience' }
    ],
    strengths: [],
    flags: [],
    salaryExpectation: '$80k',
    availability: 'Immediate',
    emailDrafts: {
      rejection_message: 'Dear James,\n\nThank you for your interest in the Full Stack Engineer position. After reviewing your application, we have decided to move forward with candidates who have more experience in React and TypeScript.\n\nBest regards,\nRecruit-AI Team'
    }
  },
  {
    id: '4',
    name: 'Emily Chen',
    role: 'Product Designer',
    email: 'emily.chen@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    initials: 'EC',
    baseScore: 88,
    weightedScore: 88,
    scoreLevel: 'High',
    summary: 'Portfolio shows strong Figma systems thinking. Background in B2B SaaS matches our needs.',
    status: 'Pending Review',
    recommendedAction: 'Interview',
    skills: ['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'],
    experience: [
      {
        title: 'Senior Product Designer',
        company: 'SaaS Corp',
        period: '2019 - Present',
        description: 'Led design for enterprise dashboard products.',
        tags: ['B2B', 'SaaS']
      }
    ],
    education: [
      {
        degree: 'MFA Design',
        school: 'Rhode Island School of Design',
        period: '2015 - 2017'
      }
    ],
    skillGaps: [
      { skill: 'Figma', priority: 'Essential', status: 'Fully Met', note: 'Expert level' },
      { skill: 'User Research', priority: 'Essential', status: 'Fully Met', note: 'Conducted 100+ interviews' }
    ],
    strengths: ['Consulting Exp', 'Problem Solving'],
    flags: [],
    salaryExpectation: '$160k',
    availability: '1 Month',
    emailDrafts: {
      rejection_message: 'Dear Emily,\n\nThank you for applying. We appreciate your time and interest in joining our team.\n\nBest regards,\nRecruit-AI Team'
    }
  },
  {
    id: '5',
    name: 'David Miller',
    role: 'Senior FE Engineer',
    email: 'david.miller@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Denver, CO',
    initials: 'DM',
    baseScore: 88,
    weightedScore: 88,
    scoreLevel: 'High',
    summary: 'Strong frontend background with 5 years React experience. Good cultural fit.',
    status: 'Selected',
    recommendedAction: 'Interview',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    experience: [
      {
        title: 'Senior FE Engineer',
        company: 'WebCorp',
        period: '2020 - Present',
        description: 'Built complex React applications.',
        tags: ['React', 'Frontend']
      }
    ],
    education: [
      {
        degree: 'BS Software Engineering',
        school: 'Colorado State',
        period: '2014 - 2018'
      }
    ],
    skillGaps: [
      { skill: 'React', priority: 'Essential', status: 'Fully Met', note: '5 years production experience' },
      { skill: 'TypeScript', priority: 'Essential', status: 'Fully Met', note: 'Daily usage' }
    ],
    strengths: ['Modern UI', 'Fast Learner'],
    flags: ['Short Tenures', 'Remote Only'],
    salaryExpectation: '$130k',
    availability: '2 Weeks',
    emailDrafts: {
      rejection_message: 'Dear David,\n\nThank you for applying. We appreciate your interest.\n\nBest regards,\nRecruit-AI Team'
    }
  },
  {
    id: '6',
    name: 'Alex Johnson',
    role: 'Freelance Full Stack Dev',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 678-9012',
    location: 'Portland, OR',
    initials: 'AJ',
    baseScore: 76,
    weightedScore: 76,
    scoreLevel: 'Good',
    summary: 'Diverse freelance background. Good problem solver but looking for stability.',
    status: 'Hold',
    recommendedAction: 'Hold',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    experience: [
      {
        title: 'Freelance Developer',
        company: 'Self-employed',
        period: '2018 - Present',
        description: 'Various client projects across different tech stacks.',
        tags: ['Freelance']
      }
    ],
    education: [
      {
        degree: 'Self-taught',
        school: 'Online Courses',
        period: '2016 - 2018'
      }
    ],
    skillGaps: [
      { skill: 'React', priority: 'Essential', status: 'Fully Met', note: '6 years experience' },
      { skill: 'Team Collaboration', priority: 'Preferred', status: 'Partial Match', note: 'Mostly solo work' }
    ],
    strengths: ['Problem Solving', 'Consulting Exp'],
    flags: [],
    salaryExpectation: '$160k',
    availability: '1 Month',
    emailDrafts: {
      rejection_message: 'Dear Alex,\n\nThank you for your application. We have decided to move forward with other candidates at this time.\n\nBest regards,\nRecruit-AI Team'
    }
  }
];

export const defaultWeights: PriorityWeights = {
  techSkills: 35,
  experience: 25,
  education: 15,
  salaryFit: 15,
  availability: 10
};
