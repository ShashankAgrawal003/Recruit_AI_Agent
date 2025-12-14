// Fallback JD text to use when PDF/DOCX parsing fails or returns unreadable content

export const FALLBACK_JD_TEXT = `Associate Product Manager - Lending
Location: Bangalore
Experience: 1–3 Years

About the Company
We are a fast-growing fintech startup focused on revolutionizing the lending experience for underserved segments. Our mission is to make credit accessible, transparent, and user-friendly through innovative technology solutions.

Role Overview
We are looking for an Associate Product Manager to join our Lending team. You will work closely with cross-functional teams to define, build, and launch lending products that delight our customers and drive business growth.

Key Responsibilities
1. Define product requirements by gathering insights from customers, stakeholders, and market research.
2. Write clear and detailed Product Requirement Documents (PRDs) for engineering and design teams.
3. Collaborate with engineering, design, risk, and operations teams to deliver products on time.
4. Prioritize features and enhancements based on business impact and customer value.
5. Monitor product performance through key metrics and iterate based on data-driven insights.
6. Conduct competitive analysis and stay updated on industry trends in digital lending.
7. Own the end-to-end product lifecycle from ideation to launch and beyond.
8. Work with compliance and legal teams to ensure regulatory adherence.
9. Create wireframes and low-fidelity prototypes to communicate product ideas effectively.
10. Manage stakeholder communication and provide regular product updates.
11. Support user research and usability testing to improve product experience.
12. Identify opportunities for automation and process improvement.
13. Drive alignment across teams through effective documentation and communication.

Qualifications
• Bachelor's degree in Engineering, Business, or a related field.
• 1–3 years of experience in product management, preferably in fintech or lending.
• Strong analytical and problem-solving skills.
• Excellent written and verbal communication skills.
• Familiarity with agile development methodologies.
• Ability to work in a fast-paced, dynamic environment.
• Experience with product analytics tools (e.g., Mixpanel, Amplitude) is a plus.

What We Offer
• Competitive salary and equity options.
• Opportunity to work on impactful products in a high-growth environment.
• Collaborative and inclusive work culture.
• Learning and development opportunities.
• Flexible work arrangements.`;

/**
 * Check if extracted text is readable and valid
 * Returns true if text contains meaningful content
 */
export function isReadableText(text: string | null | undefined): boolean {
  if (!text) return false;
  
  // Check if text has enough readable characters
  const cleanText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  if (cleanText.length < 100) return false;
  
  // Check for common PDF binary artifacts
  const binaryPatterns = [
    /[^\x20-\x7E\n\r\t]/g, // Non-printable characters
    /stream\s*[\s\S]*?endstream/gi, // PDF stream objects
    /obj\s*[\s\S]*?endobj/gi, // PDF objects
    /%PDF/gi, // PDF header
  ];
  
  // Count readable words (at least 3 letters)
  const wordCount = (cleanText.match(/[a-zA-Z]{3,}/g) || []).length;
  
  // Text should have reasonable word density
  if (wordCount < 20) return false;
  
  // Check ratio of printable vs non-printable
  const printableCount = cleanText.replace(/[^a-zA-Z0-9\s.,;:!?'"()-]/g, '').length;
  const ratio = printableCount / cleanText.length;
  
  return ratio > 0.7;
}

/**
 * Clean extracted text by removing binary artifacts
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only printable ASCII
    .trim();
}
