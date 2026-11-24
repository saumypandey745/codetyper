/**
 * Official CodeTyper Certificate Eligibility & Accreditation Standards
 *
 * Requirements:
 * 1. Minimum Duration: ≥ 55 seconds (standard 60s timed assessment).
 * 2. Minimum Characters: ≥ 150 characters (prevents single-word or idle cheats).
 * 3. Minimum Net WPM: ≥ 35.00 Net WPM (professional typing competency benchmark).
 * 4. Minimum Accuracy: ≥ 90.00% (Typing Master accredited precision standard).
 */

export const CERTIFICATE_REQUIREMENTS = {
  minDurationSeconds: 55, // Full standard timed assessment (~60s)
  minCharacters: 150,     // Substantial typing volume
  minNetWpm: 35,          // Professional touch-typing speed benchmark
  minAccuracy: 90         // High-precision accuracy threshold
};

export function checkCertificateEligibility(result) {
  if (!result) {
    return {
      isEligible: false,
      checks: [],
      passedCount: 0,
      totalCount: 4,
      progressPercent: 0,
      tierTitle: 'Uncertified',
      tierBadge: 'None'
    };
  }

  const durationSec = Math.round(Number(result.durationSeconds) || 0);
  const totalChars = Number(result.totalCharacters ?? result.totalChars) || 0;
  const netWpm = Math.round((Number(result.netWpm) || 0) * 100) / 100;
  const accuracy = Math.round((Number(result.accuracy) || 0) * 100) / 100;

  const checks = [
    {
      id: 'duration',
      title: 'Examination Duration',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minDurationSeconds}s (60s Test)`,
      current: `${durationSec}s`,
      passed: durationSec >= CERTIFICATE_REQUIREMENTS.minDurationSeconds,
      description: 'Session must be a formal full-length timed assessment.'
    },
    {
      id: 'characters',
      title: 'Typed Characters Volume',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minCharacters} Chars`,
      current: `${totalChars} chars`,
      passed: totalChars >= CERTIFICATE_REQUIREMENTS.minCharacters,
      description: 'Substantial text volume to prove consistent typing cadence without idle pauses.'
    },
    {
      id: 'speed',
      title: 'Net Typing Speed',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minNetWpm}.00 Net WPM`,
      current: `${netWpm.toFixed(2)} WPM`,
      passed: netWpm >= CERTIFICATE_REQUIREMENTS.minNetWpm,
      description: 'Meets the recognized professional touch-typing speed benchmark.'
    },
    {
      id: 'accuracy',
      title: 'Typing Accuracy Rate',
      required: `≥ ${CERTIFICATE_REQUIREMENTS.minAccuracy}.00%`,
      current: `${accuracy.toFixed(2)}%`,
      passed: accuracy >= CERTIFICATE_REQUIREMENTS.minAccuracy,
      description: 'Maintains high precision with low uncorrected errors.'
    }
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const isEligible = passedCount === checks.length;
  const progressPercent = Math.round((passedCount / checks.length) * 100);

  // Rank Tier determination
  let tierTitle = 'Certified Typist (Silver Tier)';
  let tierBadge = 'Silver';
  let tierGrade = 'Grade B';
  let tierPercentile = 'Professional Competent';

  if (netWpm >= 120) {
    tierTitle = 'Grandmaster Typist';
    tierBadge = 'Grandmaster';
    tierGrade = 'Grade A+ Exceptional';
    tierPercentile = 'Top 0.1% Worldwide';
  } else if (netWpm >= 90) {
    tierTitle = 'Master Typist';
    tierBadge = 'Diamond';
    tierGrade = 'Grade A+ Distinguished';
    tierPercentile = 'Top 1% Worldwide';
  } else if (netWpm >= 70) {
    tierTitle = 'Pro Elite Typist';
    tierBadge = 'Platinum';
    tierGrade = 'Grade A Advanced';
    tierPercentile = 'Top 5% Worldwide';
  } else if (netWpm >= 50) {
    tierTitle = 'Advanced Typist';
    tierBadge = 'Gold';
    tierGrade = 'Grade B+ Professional';
    tierPercentile = 'Top 15% Worldwide';
  } else {
    tierTitle = 'Certified Typist';
    tierBadge = 'Silver';
    tierGrade = 'Grade B Competent';
    tierPercentile = 'Standard Professional';
  }

  return {
    isEligible,
    checks,
    passedCount,
    totalCount: checks.length,
    progressPercent,
    tierTitle,
    tierBadge,
    tierGrade,
    tierPercentile
  };
}

export const CERTIFICATE_ROLES = [
  'Touch-Typing Specialist',
  'Full-Stack Software Engineer',
  'Frontend Web Developer',
  'Backend & Systems Architect',
  'Competitive Typist & Grandmaster',
  'Data Scientist & AI Practitioner',
  'Technical Writer & Typist',
  'DevOps & Cloud Engineer',
  'Computer Science Scholar'
];

export function getLinkedInCertificationUrl({ certId, recipientName, wpm, tierTitle, issueDate }) {
  const certName = `Accredited Touch-Typing Competency - ${tierTitle} (${Math.round(wpm)} WPM)`;
  const orgName = 'CodeTyper';
  const certUrl = `https://codetyper.dev/#verify/${encodeURIComponent(certId)}`;
  const dateObj = issueDate ? new Date(issueDate) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;

  return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certName)}&organizationName=${encodeURIComponent(orgName)}&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(certId)}`;
}

export function getSocialShareUrls({ certId, recipientName, wpm, accuracy, tierTitle }) {
  const verifyUrl = `https://codetyper.dev/#verify/${encodeURIComponent(certId)}`;
  const text = `🏆 I just earned my official Accredited Typing Certificate on CodeTyper with ${Number(wpm).toFixed(1)} WPM and ${Number(accuracy).toFixed(1)}% accuracy, signed by Founder & App Owner Saumy Pandey! Verify my credential here: ${verifyUrl}`;

  return {
    verifyUrl,
    linkedInShare: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent(`🏆 CodeTyper Accredited Certificate - ${Number(wpm).toFixed(1)} WPM, signed by Saumy Pandey`)}`
  };
}
