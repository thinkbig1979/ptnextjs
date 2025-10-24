/**
 * Form Test Data Fixtures
 *
 * Test data for form validation scenarios across all dashboard forms.
 * Includes valid and invalid data for each form component.
 */

import type {
  Vendor,
  Certification,
  Award,
  CaseStudy,
  TeamMember,
  VideoIntroduction,
} from '@/lib/types';

// ============================================================================
// Basic Info Form Test Data
// ============================================================================

export const validBasicInfoData: Partial<Vendor> = {
  companyName: 'Test Marine Services Ltd',
  slug: 'test-marine-services',
  description: 'Premier marine services provider specializing in yacht maintenance and refits',
  email: 'contact@testmarine.com',
  phone: '+1-555-0100',
  website: 'https://testmarine.com',
  logo: 'https://example.com/logos/test-marine.png',
};

export const invalidBasicInfoData = {
  emptyCompanyName: {
    ...validBasicInfoData,
    companyName: '',
    expectedError: /company name is required/i,
  },
  tooLongCompanyName: {
    ...validBasicInfoData,
    companyName: 'A'.repeat(256),
    expectedError: /company name must be 255 characters or less/i,
  },
  invalidSlug: {
    ...validBasicInfoData,
    slug: 'Invalid Slug!@#',
    expectedError: /slug must contain only lowercase letters, numbers, and hyphens/i,
  },
  invalidEmail: {
    ...validBasicInfoData,
    email: 'not-an-email',
    expectedError: /invalid email address/i,
  },
  invalidPhoneShort: {
    ...validBasicInfoData,
    phone: '123',
    expectedError: /phone number must be at least 10 characters/i,
  },
  tooLongDescription: {
    ...validBasicInfoData,
    description: 'A'.repeat(1001),
    expectedError: /description must be 1000 characters or less/i,
  },
};

// ============================================================================
// Brand Story Form Test Data
// ============================================================================

export const validBrandStoryData: Partial<Vendor> = {
  foundedYear: 2010,
  website: 'https://example.com',
  linkedinUrl: 'https://linkedin.com/company/example',
  twitterUrl: 'https://twitter.com/example',
  totalProjects: 150,
  employeeCount: 25,
  linkedinFollowers: 5000,
  instagramFollowers: 3000,
  clientSatisfactionScore: 95,
  longDescription: '<p>Detailed company history and values...</p>',
  serviceAreas: ['Mediterranean', 'Caribbean', 'Southeast Asia'],
  companyValues: ['Quality', 'Innovation', 'Sustainability', 'Customer Focus'],
};

export const invalidBrandStoryData = {
  foundedYearBelowMinimum: {
    ...validBrandStoryData,
    foundedYear: 1799,
    expectedError: /founded year must be 1800 or later/i,
  },
  foundedYearInFuture: {
    ...validBrandStoryData,
    foundedYear: new Date().getFullYear() + 1,
    expectedError: /founded year cannot be in the future/i,
  },
  invalidWebsiteUrl: {
    ...validBrandStoryData,
    website: 'not-a-url',
    expectedError: /invalid url format/i,
  },
  invalidLinkedInUrl: {
    ...validBrandStoryData,
    linkedinUrl: 'https://example.com', // Not a LinkedIn URL
    expectedError: /must be a valid linkedin url/i,
  },
  negativeTotalProjects: {
    ...validBrandStoryData,
    totalProjects: -10,
    expectedError: /total projects must be a positive number/i,
  },
  negativeEmployeeCount: {
    ...validBrandStoryData,
    employeeCount: -5,
    expectedError: /employee count must be a positive number/i,
  },
  satisfactionScoreAboveMax: {
    ...validBrandStoryData,
    clientSatisfactionScore: 101,
    expectedError: /satisfaction score must be between 0 and 100/i,
  },
  satisfactionScoreBelowMin: {
    ...validBrandStoryData,
    clientSatisfactionScore: -1,
    expectedError: /satisfaction score must be between 0 and 100/i,
  },
};

// ============================================================================
// Certification Test Data
// ============================================================================

export const validCertificationData: Certification = {
  id: 'cert-test-1',
  name: 'ISO 9001:2015 Quality Management',
  issuingOrganization: 'International Organization for Standardization',
  dateObtained: '2020-06-15',
  expiryDate: '2023-06-15',
  credentialId: 'ISO-9001-2020-12345',
  credentialUrl: 'https://iso.org/verify/12345',
  description: 'Quality management system certification',
  logo: 'https://example.com/certs/iso-9001.png',
};

export const validCertificationMinimal: Certification = {
  id: 'cert-test-2',
  name: 'Marine Industry Certification',
  issuingOrganization: 'Marine Trade Association',
  dateObtained: '2019-03-20',
  // Optional fields omitted
};

export const invalidCertificationData = {
  missingName: {
    ...validCertificationData,
    name: '',
    expectedError: /certification name is required/i,
  },
  missingOrganization: {
    ...validCertificationData,
    issuingOrganization: '',
    expectedError: /issuing organization is required/i,
  },
  invalidDateFormat: {
    ...validCertificationData,
    dateObtained: '15/06/2020', // Wrong format
    expectedError: /invalid date format/i,
  },
  expiryBeforeObtained: {
    ...validCertificationData,
    dateObtained: '2023-06-15',
    expiryDate: '2020-06-15', // Expiry before obtained
    expectedError: /expiry date must be after date obtained/i,
  },
  invalidCredentialUrl: {
    ...validCertificationData,
    credentialUrl: 'not-a-url',
    expectedError: /invalid url format/i,
  },
};

// ============================================================================
// Award Test Data
// ============================================================================

export const validAwardData: Award = {
  id: 'award-test-1',
  title: 'Best Marine Service Provider 2022',
  awardingOrganization: 'Yachting Excellence Awards',
  dateReceived: '2022-11-10',
  description: 'Recognized for outstanding service quality and customer satisfaction',
  category: 'Service Excellence',
  logo: 'https://example.com/awards/yea-2022.png',
};

export const validAwardMinimal: Award = {
  id: 'award-test-2',
  title: 'Innovation Award',
  awardingOrganization: 'Marine Technology Forum',
  dateReceived: '2023-05-15',
};

export const invalidAwardData = {
  missingTitle: {
    ...validAwardData,
    title: '',
    expectedError: /award title is required/i,
  },
  missingOrganization: {
    ...validAwardData,
    awardingOrganization: '',
    expectedError: /awarding organization is required/i,
  },
  invalidDate: {
    ...validAwardData,
    dateReceived: 'not-a-date',
    expectedError: /invalid date format/i,
  },
  futureDateReceived: {
    ...validAwardData,
    dateReceived: '2030-01-01',
    expectedError: /date received cannot be in the future/i,
  },
};

// ============================================================================
// Case Study Test Data
// ============================================================================

export const validCaseStudyData: CaseStudy = {
  id: 'case-test-1',
  title: '150ft Mega Yacht Complete Refit',
  client: 'Confidential Private Owner',
  projectDate: '2022-05',
  duration: '6 months',
  yachtLength: 150,
  yachtType: 'Motor Yacht',
  description: 'Complete interior and exterior refit of a luxury mega yacht',
  challenge: 'Tight deadline of 6 months with complex custom requirements for interior design and technical systems upgrade',
  solution: 'Assembled a specialized team of 30 craftsmen, implemented parallel workflow processes, and maintained 24/7 operations during critical phases',
  results: 'Delivered project 2 weeks ahead of schedule with zero defects, resulting in a 98% client satisfaction score',
  testimonial: 'Exceptional workmanship and project management. The team exceeded all our expectations and delivered a stunning result.',
  clientName: 'John D.',
  clientRole: 'Yacht Owner Representative',
  images: [
    'https://example.com/case-studies/refit-before.jpg',
    'https://example.com/case-studies/refit-during.jpg',
    'https://example.com/case-studies/refit-after.jpg',
  ],
  featured: true,
};

export const validCaseStudyMinimal: CaseStudy = {
  id: 'case-test-2',
  title: 'Yacht Navigation System Upgrade',
  client: 'Private Owner',
  projectDate: '2023-08',
  description: 'Upgraded navigation and communication systems',
  challenge: 'Integration with existing systems',
  solution: 'Custom integration solution',
  results: 'Successful upgrade completed on time',
};

export const invalidCaseStudyData = {
  missingTitle: {
    ...validCaseStudyData,
    title: '',
    expectedError: /case study title is required/i,
  },
  missingDescription: {
    ...validCaseStudyData,
    description: '',
    expectedError: /description is required/i,
  },
  invalidProjectDate: {
    ...validCaseStudyData,
    projectDate: 'invalid-date',
    expectedError: /invalid date format/i,
  },
  futureProjectDate: {
    ...validCaseStudyData,
    projectDate: '2030-01',
    expectedError: /project date cannot be in the future/i,
  },
  negativeYachtLength: {
    ...validCaseStudyData,
    yachtLength: -10,
    expectedError: /yacht length must be positive/i,
  },
  tooLongTestimonial: {
    ...validCaseStudyData,
    testimonial: 'A'.repeat(1001),
    expectedError: /testimonial must be 1000 characters or less/i,
  },
};

// ============================================================================
// Team Member Test Data
// ============================================================================

export const validTeamMemberData: TeamMember = {
  id: 'team-test-1',
  name: 'John Smith',
  role: 'Lead Marine Engineer',
  bio: '20+ years of experience in yacht engineering and project management. Specialized in propulsion systems and electrical installations.',
  photo: 'https://example.com/team/john-smith.jpg',
  email: 'john.smith@testmarine.com',
  phone: '+1-555-0101',
  linkedinUrl: 'https://linkedin.com/in/johnsmith',
  displayOrder: 1,
  certifications: ['Marine Engineering License', 'Project Management Professional'],
};

export const validTeamMemberMinimal: TeamMember = {
  id: 'team-test-2',
  name: 'Jane Doe',
  role: 'Senior Technician',
  displayOrder: 2,
};

export const invalidTeamMemberData = {
  missingName: {
    ...validTeamMemberData,
    name: '',
    expectedError: /name is required/i,
  },
  missingRole: {
    ...validTeamMemberData,
    role: '',
    expectedError: /role is required/i,
  },
  invalidEmail: {
    ...validTeamMemberData,
    email: 'not-an-email',
    expectedError: /invalid email address/i,
  },
  invalidLinkedInUrl: {
    ...validTeamMemberData,
    linkedinUrl: 'https://example.com',
    expectedError: /must be a valid linkedin url/i,
  },
  tooLongBio: {
    ...validTeamMemberData,
    bio: 'A'.repeat(1001),
    expectedError: /bio must be 1000 characters or less/i,
  },
  negativeDisplayOrder: {
    ...validTeamMemberData,
    displayOrder: -1,
    expectedError: /display order must be positive/i,
  },
};

// ============================================================================
// Video Introduction Test Data
// ============================================================================

export const validVideoIntroductionData: VideoIntroduction = {
  url: 'https://vimeo.com/123456789',
  thumbnail: 'https://example.com/video-thumbs/intro.jpg',
  duration: 120, // 2 minutes in seconds
  title: 'Welcome to Test Marine Services',
  description: 'Learn about our history, values, and commitment to excellence',
};

export const invalidVideoIntroductionData = {
  invalidUrl: {
    ...validVideoIntroductionData,
    url: 'not-a-url',
    expectedError: /invalid video url/i,
  },
  unsupportedPlatform: {
    ...validVideoIntroductionData,
    url: 'https://example.com/video.mp4',
    expectedError: /video must be hosted on youtube or vimeo/i,
  },
  negativeDuration: {
    ...validVideoIntroductionData,
    duration: -10,
    expectedError: /duration must be positive/i,
  },
  tooLongDuration: {
    ...validVideoIntroductionData,
    duration: 601, // Over 10 minutes
    expectedError: /video duration must be 10 minutes or less/i,
  },
};

// ============================================================================
// Promotion Pack Test Data
// ============================================================================

export const validPromotionPackData = {
  featuredPlacement: true,
  editorialCoverage: false,
  searchHighlight: true,
  newsletterSpotlight: false,
  socialMediaPromotion: true,
};

// ============================================================================
// Edge Case Test Data
// ============================================================================

/**
 * Edge cases for years in business computation
 */
export const yearsInBusinessEdgeCases = [
  {
    description: 'Founded this year (0 years)',
    foundedYear: new Date().getFullYear(),
    expectedYears: 0,
    valid: true,
  },
  {
    description: 'Founded at minimum year (1800)',
    foundedYear: 1800,
    expectedYears: new Date().getFullYear() - 1800,
    valid: true,
  },
  {
    description: 'Founded below minimum (1799)',
    foundedYear: 1799,
    expectedYears: null,
    valid: false,
  },
  {
    description: 'Founded in future',
    foundedYear: new Date().getFullYear() + 1,
    expectedYears: null,
    valid: false,
  },
  {
    description: 'Null founded year',
    foundedYear: null,
    expectedYears: null,
    valid: false,
  },
];

/**
 * Boundary value test cases for numeric fields
 */
export const boundaryValueTestCases = {
  clientSatisfactionScore: [
    { value: 0, valid: true, description: 'Minimum valid score' },
    { value: 50, valid: true, description: 'Mid-range score' },
    { value: 100, valid: true, description: 'Maximum valid score' },
    { value: -1, valid: false, description: 'Below minimum' },
    { value: 101, valid: false, description: 'Above maximum' },
  ],
  totalProjects: [
    { value: 0, valid: true, description: 'Zero projects (new company)' },
    { value: 1, valid: true, description: 'One project' },
    { value: 10000, valid: true, description: 'Many projects' },
    { value: -1, valid: false, description: 'Negative projects' },
  ],
  employeeCount: [
    { value: 1, valid: true, description: 'Single employee (sole proprietor)' },
    { value: 100, valid: true, description: 'Medium company' },
    { value: 0, valid: false, description: 'Zero employees (invalid)' },
    { value: -1, valid: false, description: 'Negative employees' },
  ],
};

/**
 * String length test cases
 */
export const stringLengthTestCases = {
  companyName: {
    maxLength: 255,
    validShort: 'ABC',
    validLong: 'A'.repeat(255),
    invalidTooLong: 'A'.repeat(256),
  },
  description: {
    maxLength: 1000,
    validShort: 'Short description.',
    validLong: 'A'.repeat(1000),
    invalidTooLong: 'A'.repeat(1001),
  },
  slug: {
    maxLength: 100,
    validShort: 'test',
    validLong: 'a'.repeat(100),
    invalidTooLong: 'a'.repeat(101),
    invalidChars: 'Invalid Slug!',
    validChars: 'valid-slug-123',
  },
};

/**
 * Date format test cases
 */
export const dateFormatTestCases = [
  { input: '2022-01-15', valid: true, description: 'Valid ISO date' },
  { input: '2022-01', valid: true, description: 'Valid year-month' },
  { input: '2022', valid: true, description: 'Valid year only' },
  { input: '01/15/2022', valid: false, description: 'Invalid format (US)' },
  { input: '15-01-2022', valid: false, description: 'Invalid format (UK)' },
  { input: 'not-a-date', valid: false, description: 'Invalid string' },
];

/**
 * URL format test cases
 */
export const urlFormatTestCases = {
  website: [
    { url: 'https://example.com', valid: true },
    { url: 'http://example.com', valid: true },
    { url: 'https://sub.example.com/path', valid: true },
    { url: 'example.com', valid: false, description: 'Missing protocol' },
    { url: 'not-a-url', valid: false },
  ],
  linkedinUrl: [
    { url: 'https://linkedin.com/company/example', valid: true },
    { url: 'https://www.linkedin.com/company/example', valid: true },
    { url: 'https://linkedin.com/in/person', valid: true },
    { url: 'https://example.com', valid: false, description: 'Not LinkedIn' },
  ],
  videoUrl: [
    { url: 'https://youtube.com/watch?v=abc123', valid: true },
    { url: 'https://youtu.be/abc123', valid: true },
    { url: 'https://vimeo.com/123456789', valid: true },
    { url: 'https://example.com/video.mp4', valid: false, description: 'Direct file not supported' },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current year for dynamic test data
 */
export const getCurrentYear = () => new Date().getFullYear();

/**
 * Generate a valid founded year (10 years ago)
 */
export const getValidFoundedYear = () => getCurrentYear() - 10;

/**
 * Generate a future founded year (invalid)
 */
export const getFutureFoundedYear = () => getCurrentYear() + 1;

/**
 * Generate a date in the past (for awards, certifications)
 */
export const getPastDate = (yearsAgo: number = 2) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Generate a date in the future (invalid for most fields)
 */
export const getFutureDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
};
