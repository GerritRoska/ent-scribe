export interface Template {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "new-patient-ent",
    name: "New Patient ENT",
    isDefault: true,
    content: `CHIEF COMPLAINT:


HISTORY OF PRESENT ILLNESS:
Patient is a [age]-year-old [sex] presenting with:
Onset:
Duration:
Character:
Associated symptoms:
Aggravating/relieving factors:
Previous treatments:


PAST MEDICAL HISTORY:


PAST SURGICAL HISTORY:


MEDICATIONS:


ALLERGIES:


SOCIAL HISTORY:


FAMILY HISTORY:


REVIEW OF SYSTEMS:
Constitutional:
HEENT:
Respiratory:
Cardiovascular:
GI:


PHYSICAL EXAMINATION:
Vitals: Not documented.
General: Alert and oriented, in no acute distress.
Head:
Ears: External ear canals clear bilaterally. Tympanic membranes intact.
Nose:
Oral cavity/Oropharynx:
Neck:
Cranial nerves: Grossly intact.


ASSESSMENT:


PLAN:


CPT CODE(S):
ICD-10 CODE(S):`,
  },
  {
    id: "sinus-rhinitis",
    name: "Sinus / Rhinitis",
    isDefault: true,
    content: `CHIEF COMPLAINT:


HISTORY OF PRESENT ILLNESS:
Patient presents with nasal/sinus complaints.
Duration:
Nasal congestion:
Nasal drainage (quality/color):
Facial pressure/pain:
Post-nasal drip:
Sneezing/itching:
Loss of smell:
Prior episodes:
Previous treatments tried:


MEDICATIONS:


ALLERGIES:


PHYSICAL EXAMINATION:
Vitals: Not documented.
External nose:
Nasal mucosa:
Turbinates:
Septum:
Sinus tenderness:
Oropharynx:
Neck: No lymphadenopathy.


ASSESSMENT:


PLAN:


FOLLOW-UP:


CPT CODE(S): 99213 or 99214 (E&M level based on complexity)
ICD-10 CODE(S):`,
  },
  {
    id: "hearing-evaluation",
    name: "Hearing Evaluation",
    isDefault: true,
    content: `CHIEF COMPLAINT:
Hearing loss / hearing evaluation.

HISTORY OF PRESENT ILLNESS:
Laterality (right/left/bilateral):
Onset (sudden vs. gradual):
Duration:
Associated tinnitus:
Associated vertigo/dizziness:
Otalgia:
Otorrhea:
Noise exposure history:
Family history of hearing loss:
Prior hearing tests:


MEDICATIONS (including ototoxic meds):


PHYSICAL EXAMINATION:
External ear canals: Clear bilaterally.
Tympanic membranes:
Weber test:
Rinne test:


AUDIOGRAM RESULTS:
Right ear:
Left ear:
Speech discrimination:
Tympanometry:


ASSESSMENT:


PLAN:


FOLLOW-UP:


CPT CODE(S): 92557 (Comprehensive audiometry)
ICD-10 CODE(S):`,
  },
  {
    id: "nasal-endoscopy",
    name: "Nasal Endoscopy",
    isDefault: true,
    content: `PROCEDURE NOTE: Nasal Endoscopy

DATE:
PHYSICIAN:
INDICATION:

PROCEDURE:
Informed consent was obtained. The patient was placed in the seated position.
Topical decongestant/anesthetic applied as appropriate.
Flexible/rigid nasal endoscope introduced into the nasal cavity.

FINDINGS:
Right nasal cavity:
  - Nasal vestibule:
  - Inferior turbinate:
  - Middle turbinate:
  - Middle meatus/sinus drainage:
  - Septum:
  - Nasopharynx:

Left nasal cavity:
  - Nasal vestibule:
  - Inferior turbinate:
  - Middle turbinate:
  - Middle meatus/sinus drainage:
  - Septum:
  - Nasopharynx:

ASSESSMENT:


PLAN:


CPT CODE(S): 31231 (Nasal endoscopy, diagnostic)
ICD-10 CODE(S):`,
  },
  {
    id: "post-op-check",
    name: "Post-Op Check",
    isDefault: true,
    content: `POST-OPERATIVE VISIT NOTE

PROCEDURE PERFORMED:
DATE OF SURGERY:
DAYS POST-OP:

CHIEF COMPLAINT / REASON FOR VISIT:


INTERVAL HISTORY:
Pain level (0-10):
Bleeding:
Swelling:
Drainage:
Fever/chills:
Activity level:
Diet tolerance:
Medications taken as prescribed:


PHYSICAL EXAMINATION:
Vitals: Not documented.
Wound/surgical site:
Healing:


ASSESSMENT:
Post-operative day [X] following [procedure], doing well / with concerns as noted above.


PLAN:


FOLLOW-UP:


CPT CODE(S):
ICD-10 CODE(S):`,
  },
];

const STORAGE_KEY = "ent-scribe-templates";

export function getTemplates(): Template[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_TEMPLATES;
  try {
    const custom: Template[] = JSON.parse(stored);
    return [...DEFAULT_TEMPLATES, ...custom];
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplate(template: Omit<Template, "id" | "isDefault">): Template {
  const newTemplate: Template = {
    ...template,
    id: `custom-${Date.now()}`,
    isDefault: false,
  };
  const stored = localStorage.getItem(STORAGE_KEY);
  const customs: Template[] = stored ? JSON.parse(stored) : [];
  customs.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  return newTemplate;
}

export function deleteTemplate(id: string): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const customs: Template[] = JSON.parse(stored);
  const filtered = customs.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateTemplate(id: string, updates: Partial<Pick<Template, "name" | "content">>): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const customs: Template[] = JSON.parse(stored);
  const idx = customs.findIndex((t) => t.id === id);
  if (idx !== -1) {
    customs[idx] = { ...customs[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  }
}
