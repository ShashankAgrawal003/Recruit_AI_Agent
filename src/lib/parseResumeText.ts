// Utility functions to parse experience and education from raw resume text

export interface ParsedExperience {
  text: string;
}

export interface ParsedEducation {
  text: string;
}

/**
 * Parse experience information from raw resume text
 */
export function parseExperienceFromText(resumeText: string | undefined): ParsedExperience[] {
  if (!resumeText) return [];

  const experiences: ParsedExperience[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(Boolean);

  // Patterns that indicate work experience
  const experiencePatterns = [
    /(\d+)\s*\+?\s*years?\s*(of\s+)?experience/i,
    /(\d{4})\s*[-–—]\s*(present|\d{4})/i,
    /(senior|junior|lead|manager|engineer|developer|designer|analyst|consultant|director|specialist|coordinator)/i,
    /worked\s+(at|for|with)/i,
    /(company|corporation|inc\.|ltd\.|llc)/i,
  ];

  // Common job titles
  const jobTitlePatterns = [
    /software\s+engineer/i,
    /product\s+(manager|designer)/i,
    /full\s*stack\s+developer/i,
    /front\s*end\s+(developer|engineer)/i,
    /back\s*end\s+(developer|engineer)/i,
    /data\s+(scientist|analyst|engineer)/i,
    /ux\/?ui\s+designer/i,
    /project\s+manager/i,
    /technical\s+lead/i,
    /team\s+lead/i,
    /cto|ceo|coo|cfo/i,
  ];

  for (const line of lines) {
    const matchesExperience = experiencePatterns.some(pattern => pattern.test(line));
    const matchesJobTitle = jobTitlePatterns.some(pattern => pattern.test(line));

    if (matchesExperience || matchesJobTitle) {
      // Avoid duplicates
      if (!experiences.some(e => e.text === line)) {
        experiences.push({ text: line });
      }
    }
  }

  // Limit to top 5 most relevant lines
  return experiences.slice(0, 5);
}

/**
 * Parse education information from raw resume text
 */
export function parseEducationFromText(resumeText: string | undefined): ParsedEducation[] {
  if (!resumeText) return [];

  const educations: ParsedEducation[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(Boolean);

  // Education keywords
  const educationPatterns = [
    /bachelor['']?s?|b\.?tech|b\.?e\.?|b\.?s\.?|b\.?a\.?|b\.?sc/i,
    /master['']?s?|m\.?tech|m\.?s\.?|m\.?a\.?|m\.?sc|mba/i,
    /ph\.?d|doctorate|doctoral/i,
    /diploma|certificate|certification/i,
    /university|college|institute|school\s+of/i,
    /degree\s+in|graduated|major\s+in|studied/i,
    /computer\s+science|information\s+technology|engineering|business\s+administration/i,
  ];

  for (const line of lines) {
    const matchesEducation = educationPatterns.some(pattern => pattern.test(line));

    if (matchesEducation) {
      // Avoid duplicates
      if (!educations.some(e => e.text === line)) {
        educations.push({ text: line });
      }
    }
  }

  // Limit to top 4 most relevant lines
  return educations.slice(0, 4);
}

/**
 * Calculate Overall Fit based on skill gap analysis
 * @returns "Low" | "Moderate" | "High"
 */
export function calculateOverallFit(skillGaps: { status: string }[]): 'Low' | 'Moderate' | 'High' {
  if (!skillGaps || skillGaps.length === 0) return 'Moderate';

  const fullyMetCount = skillGaps.filter(s => s.status === 'Fully Met').length;
  const skillMatchPercent = Math.round((fullyMetCount / skillGaps.length) * 100);

  if (skillMatchPercent <= 50) return 'Low';
  if (skillMatchPercent <= 75) return 'Moderate';
  return 'High';
}
