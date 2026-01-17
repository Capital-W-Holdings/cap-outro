// Investor Verification Utility
// Identifies potentially fake or unverified investor profiles

// Common celebrity names that might appear as fake investor profiles
// Only include people who are NOT actual venture capital investors
const CELEBRITY_NAMES = new Set([
  'elon musk', 'jeff bezos', 'bill gates', 'warren buffett', 'mark zuckerberg',
  'larry page', 'sergey brin', 'tim cook', 'satya nadella', 'sundar pichai',
  'jack dorsey', 'evan spiegel', 'travis kalanick', 'adam neumann',
  'oprah winfrey', 'beyonce', 'kim kardashian', 'kanye west', 'jay-z',
  'lebron james', 'michael jordan', 'tom brady', 'tiger woods',
  'taylor swift', 'rihanna', 'drake', 'the rock', 'dwayne johnson',
  'tom hanks', 'leonardo dicaprio', 'brad pitt', 'george clooney',
  'jennifer aniston', 'angelina jolie', 'scarlett johansson',
  'robert downey jr', 'chris hemsworth', 'ryan reynolds',
  'donald trump', 'joe biden', 'barack obama', 'hillary clinton',
  'vladimir putin', 'xi jinping', 'narendra modi',
  'prince harry', 'prince william', 'queen elizabeth', 'king charles',
  'paris hilton', 'kylie jenner', 'kendall jenner',
  // Celebrities with fake "family office" entries
  'will smith', 'jada pinkett smith', 'reese witherspoon', 'george lucas',
  'steven spielberg',
]);

// Known fake or placeholder email domains
const FAKE_EMAIL_DOMAINS = new Set([
  'example.com', 'test.com', 'fake.com', 'placeholder.com',
  'temp.com', 'mailinator.com', 'guerrillamail.com', 'throwaway.com',
  'tempmail.com', 'fakeinbox.com', 'sharklasers.com',
]);

// Common family office indicators that might be fabricated
const SUSPICIOUS_FIRM_PATTERNS = [
  /family office/i,  // Any "family office" is suspicious - real VCs/PEs don't call themselves this
  /celebrity/i,
  /royal family/i,
  /^(test|fake|placeholder|demo)\s/i,
  /\(springhill\)/i,  // LeBron James entertainment company
  /\(hello sunshine\)/i,  // Reese Witherspoon company
  /marcy venture/i,  // Jay-Z company
];

// Legitimate VC/PE firm patterns
const LEGITIMATE_FIRM_PATTERNS = [
  /ventures$/i,
  /capital$/i,
  /partners$/i,
  /investments$/i,
  /\bvc\b/i,
  /\bpe\b/i,
  /\bfund\b/i,
  /advisors$/i,
  /management$/i,
  /holdings$/i,
  /equity$/i,
  /accelerator/i,
  /incubator/i,
  /angel/i,
  /seed\s/i,
  /growth\s/i,
  /strategy/i,
];

export interface VerificationResult {
  isVerified: boolean;
  score: number; // 0-100
  issues: string[];
  flags: {
    isCelebrity: boolean;
    hasFakeEmail: boolean;
    hasSuspiciousFirm: boolean;
    missingContactInfo: boolean;
    hasValidLinkedIn: boolean;
    hasLegitimateFirm: boolean;
  };
}

export function verifyInvestor(investor: {
  id: string;
  name: string;
  email: string | null;
  firm: string | null;
  title: string | null;
  linkedin_url: string | null;
  source: string | null;
}): VerificationResult {
  const issues: string[] = [];
  let score = 50; // Start at neutral

  // Check for celebrity names
  const nameLower = investor.name.toLowerCase().trim();
  const isCelebrity = CELEBRITY_NAMES.has(nameLower) ||
    Array.from(CELEBRITY_NAMES).some(celeb => nameLower.includes(celeb));

  if (isCelebrity) {
    issues.push(`Name matches celebrity: ${investor.name}`);
    score -= 50;
  }

  // Check email domain
  let hasFakeEmail = false;
  if (investor.email) {
    const domain = investor.email.split('@')[1]?.toLowerCase();
    if (domain && FAKE_EMAIL_DOMAINS.has(domain)) {
      hasFakeEmail = true;
      issues.push(`Fake email domain: ${domain}`);
      score -= 30;
    } else if (domain) {
      // Valid email domain adds to score
      score += 15;
    }
  }

  // Check for suspicious firm names
  let hasSuspiciousFirm = false;
  let hasLegitimateFirm = false;
  let isFamilyOffice = false;
  if (investor.firm) {
    const firmLower = investor.firm.toLowerCase();

    // "Family Office" is an automatic disqualifier - these are fake entries
    if (/family office/i.test(investor.firm)) {
      isFamilyOffice = true;
      hasSuspiciousFirm = true;
      issues.push(`Family Office entry (not a real investor contact): ${investor.firm}`);
      score -= 100; // Guaranteed to fail
    }

    // Check other suspicious patterns
    if (!isFamilyOffice) {
      for (const pattern of SUSPICIOUS_FIRM_PATTERNS) {
        if (pattern.test(firmLower)) {
          hasSuspiciousFirm = true;
          issues.push(`Suspicious firm pattern: ${investor.firm}`);
          score -= 25;
          break;
        }
      }
    }

    // Check legitimate patterns
    if (!hasSuspiciousFirm) {
      for (const pattern of LEGITIMATE_FIRM_PATTERNS) {
        if (pattern.test(firmLower)) {
          hasLegitimateFirm = true;
          score += 10;
          break;
        }
      }
    }
  } else {
    issues.push('Missing firm name');
    score -= 5;
  }

  // Check LinkedIn URL
  const hasValidLinkedIn = Boolean(
    investor.linkedin_url &&
    investor.linkedin_url.includes('linkedin.com')
  );
  if (hasValidLinkedIn) {
    score += 15;
  }

  // Check for missing contact info (less severe penalty - many real investors don't have public contact)
  const missingContactInfo = !investor.email && !investor.linkedin_url;
  if (missingContactInfo) {
    issues.push('Missing both email and LinkedIn');
    score -= 5; // Reduced penalty - missing contact info alone doesn't make a profile fake
  }

  // Source credibility
  if (investor.source === 'enrichment' || investor.source === 'openbook' || investor.source === 'sec_13f') {
    score += 10;
  }

  // Title check
  if (investor.title && /^(partner|managing|principal|director|vp|vice president|analyst|associate|founder|ceo|cfo|coo)/i.test(investor.title)) {
    score += 5;
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine if verified:
  // - Not a celebrity name
  // - No fake email
  // - Not a "Family Office" (these are fake entries)
  // - Score >= 30 (lowered threshold to be less aggressive)
  const isVerified = score >= 30 && !isCelebrity && !hasFakeEmail && !isFamilyOffice;

  return {
    isVerified,
    score,
    issues,
    flags: {
      isCelebrity,
      hasFakeEmail,
      hasSuspiciousFirm,
      missingContactInfo,
      hasValidLinkedIn,
      hasLegitimateFirm,
    },
  };
}

export interface CleanupStats {
  total: number;
  verified: number;
  unverified: number;
  celebrities: number;
  fakeEmails: number;
  suspiciousFirms: number;
  missingContact: number;
  toDelete: number;
  wouldRemain: number;
}

export function analyzeInvestors(investors: Array<{
  id: string;
  name: string;
  email: string | null;
  firm: string | null;
  title: string | null;
  linkedin_url: string | null;
  source: string | null;
}>): {
  stats: CleanupStats;
  verified: typeof investors;
  unverified: typeof investors;
  verificationResults: Map<string, VerificationResult>;
} {
  const verified: typeof investors = [];
  const unverified: typeof investors = [];
  const verificationResults = new Map<string, VerificationResult>();

  let celebrities = 0;
  let fakeEmails = 0;
  let suspiciousFirms = 0;
  let missingContact = 0;

  for (const investor of investors) {
    const result = verifyInvestor(investor);
    verificationResults.set(investor.id, result);

    if (result.isVerified) {
      verified.push(investor);
    } else {
      unverified.push(investor);
    }

    if (result.flags.isCelebrity) celebrities++;
    if (result.flags.hasFakeEmail) fakeEmails++;
    if (result.flags.hasSuspiciousFirm) suspiciousFirms++;
    if (result.flags.missingContactInfo) missingContact++;
  }

  return {
    stats: {
      total: investors.length,
      verified: verified.length,
      unverified: unverified.length,
      celebrities,
      fakeEmails,
      suspiciousFirms,
      missingContact,
      toDelete: unverified.length,
      wouldRemain: verified.length,
    },
    verified,
    unverified,
    verificationResults,
  };
}
