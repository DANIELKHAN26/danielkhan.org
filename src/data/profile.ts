/**
 * Your academic profile (About page). Taken from your CV — keep it short and current.
 * Personal details (address, phone, date of birth, student email) are deliberately NOT stored here.
 */
export const PROFILE = {
  bio: [
    'I am a PhD student in Humanities with a background in anthropology. I study digital authoritarianism, affective media and digital cultures — and what they mean for equity, resilience and representation among marginalised communities in Bangladesh and the Global South.',
    'My work combines field surveys and interviews with data analysis: coding qualitative material in ATLAS.ti, running statistics in SPSS and working with data in Python, with training in computational social science methods.',
    'Beyond research, I write The Annalist — sourced explainers on Substack — am building experimental tools for checking claims in news video and Bengali text, and am preparing a podcast.',
  ],
  interests: [
    'Digital authoritarianism',
    'Affective media',
    'Digital cultures',
    'Equity and representation',
    'Bangladesh and the Global South',
  ],
  education: [
    { award: 'PhD in Humanities', institution: '', years: '2026–present' },
    { award: 'Master of Research (MRes) in Humanities', institution: 'University of Brighton, United Kingdom', years: '' },
    { award: 'Bachelor of Social Science in Anthropology', institution: 'Shahjalal University of Science and Technology, Bangladesh', years: '' },
  ],
  experience: [
    { role: 'Research Assistant', organisation: 'University of Brighton', years: '2025' },
    { role: 'Course Coordinator', organisation: 'Brit Institute Bangladesh', years: '2023–2024' },
    { role: 'Freelance Content Writer', organisation: 'Upwork', years: '2019–2022' },
    { role: 'Research Assistant', organisation: 'Department of Anthropology, Bangladesh', years: '2019' },
  ],
  /**
   * Optional public CV, e.g. '/daniel-khan-cv.pdf' (file in public/). Empty = "available on request".
   * Remove phone number, home address and date of birth from any CV you publish.
   */
  cv: '',
  /** Skills from your CV, grouped as they appear on the About page. */
  expertise: [
    { area: 'Research methods', items: ['Field surveys and interviews', 'Qualitative coding and analysis', 'Quantitative data analysis', 'Computational social science'] },
    { area: 'Data tools', items: ['Python', 'ATLAS.ti', 'SPSS', 'EndNote'] },
    { area: 'Design and media', items: ['Figma', 'Adobe XD', 'DaVinci Resolve', 'Photoshop', 'Capture One'] },
  ],
} as const;
