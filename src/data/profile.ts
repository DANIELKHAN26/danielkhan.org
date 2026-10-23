/**
 * Your academic profile (About page). Taken from your CV — keep it short and current.
 * Personal details (address, phone, date of birth, student email) are deliberately NOT stored here.
 */
export const PROFILE = {
  bio: [
    'I am an anthropologist and PhD candidate in Arts at Macquarie University. My research connects anthropology with digital authoritarianism, affective media and digital cultures — and asks what they mean for equity, resilience and representation among marginalised communities in Bangladesh and the Global South.',
    'Alongside research, I write The Annalist on Substack, am developing experimental language tools to support news verification — including video and Bengali NLP — and am preparing a podcast.',
  ],
  interests: [
    'Digital authoritarianism',
    'Affective media',
    'Digital cultures',
    'Equity and representation',
    'Bangladesh and the Global South',
  ],
  education: [
    { award: 'PhD in Arts', institution: 'Macquarie University, Australia', years: '2026–present' },
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
  methods: ['Qualitative interviews and fieldwork', 'Python', 'ATLAS.ti', 'SPSS', 'EndNote', 'Figma', 'DaVinci Resolve'],
} as const;
