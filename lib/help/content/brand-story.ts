import type { SectionHelp } from '../types';

/**
 * Help content for the vendor brand story section
 */
export const brandStoryHelp: SectionHelp = {
  sectionId: 'brand-story',
  title: 'Brand Story',
  description: 'Tell your company story and build trust with potential customers',
  fields: [
    {
      fieldName: 'headline',
      tooltip: {
        text: 'A compelling headline that captures your company\'s essence. This appears prominently on your profile.',
        title: 'Brand Headline',
      },
      placeholder: 'Excellence in Yacht Services Since 1995',
      characterLimits: {
        min: 10,
        max: 100,
      },
    },
    {
      fieldName: 'story',
      tooltip: {
        text: 'Share your company\'s history, mission, and what sets you apart. Be authentic and engaging.',
        title: 'Company Story',
      },
      placeholder: 'Tell your company story...',
      characterLimits: {
        min: 100,
        max: 2000,
      },
    },
    {
      fieldName: 'mission',
      tooltip: {
        text: 'Your company\'s mission statement or core purpose.',
        title: 'Mission Statement',
      },
      placeholder: 'Our mission is to...',
      characterLimits: {
        max: 300,
      },
    },
    {
      fieldName: 'values',
      tooltip: {
        text: 'Key values that guide your business practices and customer relationships.',
        title: 'Core Values',
      },
      examples: ['Quality', 'Integrity', 'Innovation', 'Customer Focus'],
    },
    {
      fieldName: 'yearFounded',
      tooltip: {
        text: 'The year your company was established.',
        title: 'Year Founded',
      },
      placeholder: '1995',
    },
    {
      fieldName: 'teamSize',
      tooltip: {
        text: 'Approximate number of employees or team members.',
        title: 'Team Size',
      },
    },
    {
      fieldName: 'certifications',
      tooltip: {
        text: 'Industry certifications, accreditations, or memberships that demonstrate your expertise.',
        title: 'Certifications & Accreditations',
      },
      examples: ['ISO 9001', 'ABYC Certified', 'IYBA Member'],
    },
    // Social URLs
    {
      fieldName: 'website',
      tooltip: {
        text: 'Enter the full URL including https:// (e.g., https://example.com)',
        title: 'Website URL',
      },
    },
    {
      fieldName: 'linkedinUrl',
      tooltip: {
        text: 'Enter full URL including https:// (e.g., https://linkedin.com/company/yourcompany)',
        title: 'LinkedIn URL',
      },
    },
    {
      fieldName: 'twitterUrl',
      tooltip: {
        text: 'Enter full URL including https:// (e.g., https://twitter.com/yourhandle)',
        title: 'Twitter URL',
      },
    },
    // Founded Year
    {
      fieldName: 'foundedYear',
      tooltip: {
        text: 'Year your company was established. We\'ll calculate years in business automatically.',
        title: 'Founded Year',
      },
    },
    // Long Description
    {
      fieldName: 'longDescription',
      tooltip: {
        text: 'Detailed company story for your profile page. Be thorough and engaging.',
        title: 'Detailed Description',
      },
      characterLimits: {
        max: 5000,
      },
    },
    // Social Proof Metrics
    {
      fieldName: 'socialProofMetrics',
      tooltip: {
        text: 'Optional statistics to build trust with visitors. Only display accurate, verifiable numbers.',
        title: 'Social Proof Metrics',
      },
    },
    {
      fieldName: 'totalProjects',
      tooltip: {
        text: 'Total number of projects your company has completed.',
        title: 'Total Projects',
      },
    },
    {
      fieldName: 'employeeCount',
      tooltip: {
        text: 'Current number of employees in your organization.',
        title: 'Employee Count',
      },
    },
    {
      fieldName: 'linkedinFollowers',
      tooltip: {
        text: 'Number of followers on your LinkedIn company page.',
        title: 'LinkedIn Followers',
      },
    },
    {
      fieldName: 'instagramFollowers',
      tooltip: {
        text: 'Number of followers on your Instagram business account.',
        title: 'Instagram Followers',
      },
    },
    {
      fieldName: 'clientSatisfactionScore',
      tooltip: {
        text: 'Your average client satisfaction score (0-100). Only use verified survey data.',
        title: 'Client Satisfaction',
      },
    },
    {
      fieldName: 'repeatClientPercentage',
      tooltip: {
        text: 'Percentage of clients who return for additional services (0-100%).',
        title: 'Repeat Client Rate',
      },
    },
    // Service Areas
    {
      fieldName: 'serviceAreas',
      tooltip: {
        text: 'Geographic regions where you provide services (e.g., Mediterranean, Caribbean).',
        title: 'Service Areas',
      },
    },
    // Company Values
    {
      fieldName: 'companyValues',
      tooltip: {
        text: 'Core values that define your business culture and guide decision-making.',
        title: 'Company Values',
      },
    },
    // Video
    {
      fieldName: 'videoUrl',
      tooltip: {
        text: 'YouTube or Vimeo link to showcase your work or introduce your company.',
        title: 'Video URL',
      },
    },
    {
      fieldName: 'videoThumbnail',
      tooltip: {
        text: 'Custom thumbnail image URL for the video preview.',
        title: 'Video Thumbnail',
      },
    },
    {
      fieldName: 'videoDuration',
      tooltip: {
        text: 'Video length in minutes:seconds format (e.g., 2:30).',
        title: 'Video Duration',
      },
    },
    {
      fieldName: 'videoTitle',
      tooltip: {
        text: 'Title displayed with your video.',
        title: 'Video Title',
      },
    },
    {
      fieldName: 'videoDescription',
      tooltip: {
        text: 'Brief description of the video content.',
        title: 'Video Description',
      },
    },
    // Team Members
    {
      fieldName: 'teamMemberLinkedin',
      tooltip: {
        text: 'Enter full LinkedIn profile URL (e.g., https://linkedin.com/in/username).',
        title: 'LinkedIn Profile',
      },
    },
    {
      fieldName: 'teamMemberPhoto',
      tooltip: {
        text: 'Use a professional headshot. Square images (1:1 ratio) work best.',
        title: 'Team Photo',
      },
    },
    {
      fieldName: 'teamMemberBio',
      tooltip: {
        text: 'Brief professional biography highlighting expertise and experience.',
        title: 'Bio',
      },
      characterLimits: {
        max: 1000,
      },
    },
    // Certifications & Awards
    {
      fieldName: 'certification',
      tooltip: {
        text: 'Official credentials from recognized industry bodies (e.g., ISO, ABYC).',
        title: 'Certification',
      },
    },
    {
      fieldName: 'award',
      tooltip: {
        text: 'Industry recognition or honors received for excellence in your field.',
        title: 'Award',
      },
    },
    {
      fieldName: 'certificateUrl',
      tooltip: {
        text: 'URL to verify or view the certification document online.',
        title: 'Verification URL',
      },
    },
    // Case Studies
    {
      fieldName: 'caseStudyChallenge',
      tooltip: {
        text: 'Describe the client\'s problem or need that you addressed.',
        title: 'Challenge',
      },
    },
    {
      fieldName: 'caseStudySolution',
      tooltip: {
        text: 'Explain the approach and methods you used to solve the problem.',
        title: 'Solution',
      },
    },
    {
      fieldName: 'caseStudyResults',
      tooltip: {
        text: 'Describe measurable outcomes and benefits achieved for the client.',
        title: 'Results',
      },
    },
    {
      fieldName: 'testimonyQuote',
      tooltip: {
        text: 'Direct quote from the client about their experience working with you.',
        title: 'Client Quote',
      },
    },
    {
      fieldName: 'testimonyAuthor',
      tooltip: {
        text: 'Name of the person providing the testimonial.',
        title: 'Author Name',
      },
    },
    {
      fieldName: 'testimonyRole',
      tooltip: {
        text: 'Title or role of the person (e.g., Yacht Owner, Captain).',
        title: 'Author Role',
      },
    },
    // Media Gallery
    {
      fieldName: 'mediaImage',
      tooltip: {
        text: 'Upload JPEG, PNG, WebP, or GIF images (max 10MB). Use high-quality photos.',
        title: 'Image Upload',
      },
    },
    {
      fieldName: 'mediaAltText',
      tooltip: {
        text: 'Describe the image for accessibility and SEO. Screen readers use this text.',
        title: 'Alt Text',
      },
    },
    {
      fieldName: 'mediaCaption',
      tooltip: {
        text: 'Optional description displayed below the image in the gallery.',
        title: 'Caption',
      },
    },
    {
      fieldName: 'mediaVideo',
      tooltip: {
        text: 'Paste a YouTube or Vimeo URL to embed a video in your gallery.',
        title: 'Video URL',
      },
    },
  ],
};

export default brandStoryHelp;
