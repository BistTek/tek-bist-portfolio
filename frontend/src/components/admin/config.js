// Field definitions that drive the generic admin forms.
// type: text | textarea | markdown | list | select | checkbox | image | images | pdf
// list fields: sep ',' (comma separated) or '\n' (one per line)

export const PROJECT_CATEGORIES = ['Web', 'Python', 'AI/ML', 'Healthcare', 'Data', 'Other']

export const TABS = [
  {
    key: 'projects', label: 'Projects', endpoint: '/api/projects', labelKey: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: PROJECT_CATEGORIES, default: 'Web' },
      { name: 'year', label: 'Year', type: 'text' },
      { name: 'description', label: 'Short description', type: 'textarea', rows: 2 },
      { name: 'problem', label: 'Problem solved', type: 'textarea', rows: 2 },
      { name: 'overview', label: 'Overview', type: 'textarea' },
      { name: 'objectives', label: 'Objectives', type: 'list', sep: '\n' },
      { name: 'features', label: 'Features', type: 'list', sep: '\n' },
      { name: 'tech', label: 'Technologies', type: 'list', sep: ',' },
      { name: 'architecture', label: 'Architecture', type: 'textarea' },
      { name: 'challenges', label: 'Challenges', type: 'textarea' },
      { name: 'solutions', label: 'Solutions', type: 'textarea' },
      { name: 'results', label: 'Results', type: 'textarea' },
      { name: 'futureImprovements', label: 'Future improvements', type: 'list', sep: '\n' },
      { name: 'github', label: 'GitHub link', type: 'text' },
      { name: 'demo', label: 'Live demo link', type: 'text' },
      { name: 'image', label: 'Cover image', type: 'image' },
      { name: 'screenshots', label: 'Screenshots', type: 'images' },
      { name: 'published', label: 'Published (visible on the site)', type: 'checkbox' },
    ],
  },
  {
    key: 'notes', label: 'Notes', endpoint: '/api/notes', labelKey: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', default: 'General', help: 'e.g. Python, React, FastAPI, Networking' },
      { name: 'tags', label: 'Tags', type: 'list', sep: ',' },
      { name: 'featuredImage', label: 'Featured image', type: 'image' },
      { name: 'content', label: 'Content (Markdown)', type: 'markdown', required: true },
      { name: 'author', label: 'Author', type: 'text', help: 'Leave empty to use your profile name' },
      { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'text', help: 'Leave empty for today' },
      { name: 'published', label: 'Published (untick to keep as a draft)', type: 'checkbox' },
    ],
  },
  {
    key: 'photos', label: 'Gallery', endpoint: '/api/photos', labelKey: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'src', label: 'Photo', type: 'image', required: true },
      { name: 'category', label: 'Category', type: 'text', default: 'General', help: 'e.g. University, Hackathons, Conferences, Travel' },
      { name: 'date', label: 'Date (YYYY-MM-DD)', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'list', sep: ',' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'certifications', label: 'Certificates', endpoint: '/api/certifications', labelKey: 'name',
    fields: [
      { name: 'name', label: 'Certificate name', type: 'text', required: true },
      { name: 'issuer', label: 'Issuing organisation', type: 'text' },
      { name: 'date', label: 'Date (YYYY-MM)', type: 'text' },
      { name: 'category', label: 'Category', type: 'text', default: 'General' },
      { name: 'credentialId', label: 'Credential ID', type: 'text' },
      { name: 'verifyUrl', label: 'Verification link', type: 'text' },
      { name: 'image', label: 'Certificate image', type: 'image' },
    ],
  },
  {
    key: 'experience', label: 'Experience', endpoint: '/api/experience', labelKey: 'company',
    fields: [
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'title', label: 'Job title', type: 'text', required: true },
      { name: 'type', label: 'Employment type', type: 'select', options: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'], default: 'Full-time' },
      { name: 'start', label: 'Start (YYYY-MM)', type: 'text' },
      { name: 'end', label: 'End (YYYY-MM or Present)', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'responsibilities', label: 'Responsibilities', type: 'list', sep: '\n' },
      { name: 'tech', label: 'Technologies used', type: 'list', sep: ',' },
      { name: 'achievements', label: 'Achievements', type: 'list', sep: '\n' },
    ],
  },
  {
    key: 'education', label: 'Education', endpoint: '/api/education', labelKey: 'institution',
    fields: [
      { name: 'institution', label: 'Institution', type: 'text', required: true },
      { name: 'degree', label: 'Degree', type: 'text', required: true },
      { name: 'start', label: 'Start year', type: 'text' },
      { name: 'end', label: 'End year', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'skills', label: 'Skills', endpoint: '/api/skills', labelKey: 'category',
    fields: [
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'items', label: 'Skills', type: 'list', sep: ',', help: 'Comma-separated' },
    ],
  },
]

export const PROFILE_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'tagline', label: 'Tagline', type: 'textarea', rows: 2 },
  { name: 'shortBio', label: 'Biography', type: 'textarea', rows: 5 },
  { name: 'careerInterests', label: 'Career interests', type: 'textarea', rows: 2 },
  { name: 'technicalInterests', label: 'Technical interests', type: 'textarea', rows: 2 },
  { name: 'goals', label: 'Personal development goals', type: 'textarea', rows: 2 },
  { name: 'email', label: 'Public email', type: 'text' },
  { name: 'phone', label: 'Phone (optional, shown publicly)', type: 'text' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'github', label: 'GitHub URL', type: 'text' },
  { name: 'linkedin', label: 'LinkedIn URL', type: 'text' },
  { name: 'facebook', label: 'Facebook URL', type: 'text' },
  { name: 'instagram', label: 'Instagram URL', type: 'text' },
  { name: 'x', label: 'X (Twitter) URL', type: 'text' },
  { name: 'profilePhoto', label: 'Profile photo', type: 'image' },
  { name: 'cvFile', label: 'CV (PDF)', type: 'pdf' },
]
