const API_BASE = 'https://ent-scribe.vercel.app';

// ── Default templates ────────────────────────────────────────────────────────
const DEFAULT_TEMPLATES = [
  { id: 'new-patient-ent', name: 'New Patient ENT', isDefault: true, content: `CHIEF COMPLAINT:\n\n\nHISTORY OF PRESENT ILLNESS:\nPatient is a [age]-year-old [sex] presenting with:\nOnset:\nDuration:\nCharacter:\nAssociated symptoms:\nAggravating/relieving factors:\nPrevious treatments:\n\n\nPAST MEDICAL HISTORY:\n\n\nPAST SURGICAL HISTORY:\n\n\nMEDICATIONS:\n\n\nALLERGIES:\n\n\nSOCIAL HISTORY:\n\n\nFAMILY HISTORY:\n\n\nREVIEW OF SYSTEMS:\nConstitutional:\nHEENT:\nRespiratory:\nCardiovascular:\nGI:\n\n\nPHYSICAL EXAMINATION:\nVitals: Not documented.\nGeneral: Alert and oriented, in no acute distress.\nHead:\nEars: External ear canals clear bilaterally. Tympanic membranes intact.\nNose:\nOral cavity/Oropharynx:\nNeck:\nCranial nerves: Grossly intact.\n\n\nASSESSMENT:\n\n\nPLAN:\n\n\nCPT CODE(S):\nICD-10 CODE(S):` },
  { id: 'sinus-rhinitis', name: 'Sinus / Rhinitis', isDefault: true, content: `CHIEF COMPLAINT:\n\n\nHISTORY OF PRESENT ILLNESS:\nDuration:\nNasal congestion:\nNasal drainage (quality/color):\nFacial pressure/pain:\nPost-nasal drip:\nSneezing/itching:\nLoss of smell:\nPrior episodes:\nPrevious treatments tried:\n\n\nMEDICATIONS:\n\n\nALLERGIES:\n\n\nPHYSICAL EXAMINATION:\nVitals: Not documented.\nExternal nose:\nNasal mucosa:\nTurbinates:\nSeptum:\nSinus tenderness:\nOropharynx:\nNeck: No lymphadenopathy.\n\n\nASSESSMENT:\n\n\nPLAN:\n\n\nFOLLOW-UP:\n\n\nCPT CODE(S): 99213 or 99214\nICD-10 CODE(S):` },
  { id: 'hearing-evaluation', name: 'Hearing Evaluation', isDefault: true, content: `CHIEF COMPLAINT:\nHearing loss / hearing evaluation.\n\nHISTORY OF PRESENT ILLNESS:\nLaterality (right/left/bilateral):\nOnset (sudden vs. gradual):\nDuration:\nAssociated tinnitus:\nAssociated vertigo/dizziness:\nOtalgia:\nOtorrhea:\nNoise exposure history:\nFamily history of hearing loss:\nPrior hearing tests:\n\n\nMEDICATIONS (including ototoxic meds):\n\n\nPHYSICAL EXAMINATION:\nExternal ear canals: Clear bilaterally.\nTympanic membranes:\nWeber test:\nRinne test:\n\n\nAUDIOGRAM RESULTS:\nRight ear:\nLeft ear:\nSpeech discrimination:\nTympanometry:\n\n\nASSESSMENT:\n\n\nPLAN:\n\n\nFOLLOW-UP:\n\n\nCPT CODE(S): 92557\nICD-10 CODE(S):` },
  { id: 'nasal-endoscopy', name: 'Nasal Endoscopy', isDefault: true, content: `PROCEDURE NOTE: Nasal Endoscopy\n\nDATE:\nPHYSICIAN:\nINDICATION:\n\nPROCEDURE:\nInformed consent was obtained. The patient was placed in the seated position.\nTopical decongestant/anesthetic applied as appropriate.\nFlexible/rigid nasal endoscope introduced into the nasal cavity.\n\nFINDINGS:\nRight nasal cavity:\n  - Nasal vestibule:\n  - Inferior turbinate:\n  - Middle turbinate:\n  - Middle meatus/sinus drainage:\n  - Septum:\n  - Nasopharynx:\n\nLeft nasal cavity:\n  - Nasal vestibule:\n  - Inferior turbinate:\n  - Middle turbinate:\n  - Middle meatus/sinus drainage:\n  - Septum:\n  - Nasopharynx:\n\nASSESSMENT:\n\n\nPLAN:\n\n\nCPT CODE(S): 31231\nICD-10 CODE(S):` },
  { id: 'post-op-check', name: 'Post-Op Check', isDefault: true, content: `POST-OPERATIVE VISIT NOTE\n\nPROCEDURE PERFORMED:\nDATE OF SURGERY:\nDAYS POST-OP:\n\nCHIEF COMPLAINT / REASON FOR VISIT:\n\n\nINTERVAL HISTORY:\nPain level (0-10):\nBleeding:\nSwelling:\nDrainage:\nFever/chills:\nActivity level:\nDiet tolerance:\nMedications taken as prescribed:\n\n\nPHYSICAL EXAMINATION:\nVitals: Not documented.\nWound/surgical site:\nHealing:\n\n\nASSESSMENT:\nPost-operative day [X] following [procedure].\n\n\nPLAN:\n\n\nFOLLOW-UP:\n\n\nCPT CODE(S):\nICD-10 CODE(S):` },
];

// ── Template storage ─────────────────────────────────────────────────────────
function getCustomTemplates() {
  try { return JSON.parse(localStorage.getItem('ent-custom-templates') || '[]'); } catch { return []; }
}
function getAllTemplates() { return [...DEFAULT_TEMPLATES, ...getCustomTemplates()]; }
function saveCustomTemplate(name, content) {
  const customs = getCustomTemplates();
  customs.push({ id: 'custom-' + Date.now(), name, content, isDefault: false });
  localStorage.setItem('ent-custom-templates', JSON.stringify(customs));
}
function deleteCustomTemplate(id) {
  const customs = getCustomTemplates().filter(t => t.id !== id);
  localStorage.setItem('ent-custom-templates', JSON.stringify(customs));
}

// ── Screen navigation ────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

// ── Home screen ──────────────────────────────────────────────────────────────
function populateTemplateSelect() {
  const sel = document.getElementById('template-select');
  sel.innerHTML = '';
  getAllTemplates().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name + (t.isDefault ? '' : ' ★');
    sel.appendChild(opt);
  });
}

document.getElementById('go-templates').addEventListener('click', () => {
  renderTemplatesList();
  showScreen('templates');
});

document.getElementById('start-btn').addEventListener('click', () => {
  const sel = document.getElementById('template-select');
  const id = sel.value;
  if (!id) return;
  const name = document.getElementById('patient-name').value.trim();
  const dob = document.getElementById('patient-dob').value;
  const params = new URLSearchParams({ templateId: id });
  if (name) params.set('name', name);
  if (dob) params.set('dob', dob);
  chrome.windows.create({
    url: 'https://ent-scribe.vercel.app/record?' + params.toString(),
    type: 'popup',
    width: 480,
    height: 700,
    focused: true,
  });
});

// ── Recording ────────────────────────────────────────────────────────────────
let currentTemplate = null;
let mediaRecorder = null;
let chunks = [];
let transcriptParts = [];
let timerInterval = null;
let elapsed = 0;

function resetRecordScreen() {
  chunks = [];
  transcriptParts = [];
  elapsed = 0;
  document.getElementById('timer').classList.remove('visible');
  document.getElementById('timer-text').textContent = '00:00';
  document.getElementById('record-btn').textContent = 'START';
  document.getElementById('record-btn').classList.remove('recording');
  document.getElementById('record-btn').disabled = false;
  document.getElementById('record-hint').textContent = 'Tap to begin recording';
  document.getElementById('transcript-section').style.display = 'none';
  document.getElementById('transcript-box').textContent = '';
  document.getElementById('generating').classList.remove('visible');
}

document.getElementById('back-home').addEventListener('click', () => {
  stopRecordingCleanup();
  showScreen('home');
});

document.getElementById('record-btn').addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
  } else {
    startRecording();
  }
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus' : 'audio/webm';
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    chunks = [];
    transcriptParts = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.start();

    document.getElementById('record-btn').textContent = 'STOP';
    document.getElementById('record-btn').classList.add('recording');
    document.getElementById('record-hint').textContent = 'Tap STOP when visit ends';
    document.getElementById('timer').classList.add('visible');

    elapsed = 0;
    timerInterval = setInterval(() => {
      elapsed++;
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      document.getElementById('timer-text').textContent = m + ':' + s;
    }, 1000);
  } catch {
    // Mic blocked in side panel — open web app popup instead
    const sel = document.getElementById('template-select');
    if (sel && sel.value) {
      chrome.windows.create({
        url: 'https://ent-scribe.vercel.app/record?templateId=' + encodeURIComponent(sel.value),
        type: 'popup', width: 480, height: 700, focused: true,
      });
    }
  }
}

async function stopRecording() {
  if (!mediaRecorder) return;
  clearInterval(timerInterval);
  document.getElementById('record-btn').disabled = true;
  document.getElementById('record-btn').textContent = '…';

  mediaRecorder.onstop = async () => {
    const mimeType = mediaRecorder.mimeType || 'audio/webm';
    const blob = new Blob(chunks, { type: mimeType });
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    mediaRecorder = null;

    // Transcribe
    document.getElementById('record-hint').textContent = 'Transcribing…';
    const transcript = await transcribeBlob(blob);

    if (!transcript) {
      alert('Transcription failed. Please try again.');
      resetRecordScreen();
      return;
    }

    document.getElementById('transcript-section').style.display = 'block';
    document.getElementById('transcript-box').textContent = transcript;

    // Generate note
    document.getElementById('generating').classList.add('visible');
    const note = await generateNote(transcript, currentTemplate.content);
    document.getElementById('generating').classList.remove('visible');

    if (!note) {
      alert('Note generation failed. Please try again.');
      resetRecordScreen();
      return;
    }

    document.getElementById('note-area').value = note;
    showScreen('note');
  };

  mediaRecorder.stop();
}

function stopRecordingCleanup() {
  if (mediaRecorder) {
    try { mediaRecorder.stream.getTracks().forEach(t => t.stop()); } catch {}
    mediaRecorder = null;
  }
  clearInterval(timerInterval);
}

// ── API calls ────────────────────────────────────────────────────────────────
async function transcribeBlob(blob) {
  const form = new FormData();
  form.append('audio', blob, 'audio.webm');
  try {
    const res = await fetch(API_BASE + '/api/transcribe', { method: 'POST', body: form });
    const data = await res.json();
    return data.text || null;
  } catch { return null; }
}

async function generateNote(transcript, templateContent) {
  try {
    const res = await fetch(API_BASE + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, template: templateContent }),
    });
    const data = await res.json();
    return data.note || null;
  } catch { return null; }
}

// ── Note screen ──────────────────────────────────────────────────────────────
document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('note-area').value;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy to Clipboard'; btn.classList.remove('copied'); }, 2000);
  });
});

document.getElementById('note-home').addEventListener('click', () => { populateTemplateSelect(); showScreen('home'); });
document.getElementById('note-new').addEventListener('click', () => { populateTemplateSelect(); showScreen('home'); });

// ── Templates screen ─────────────────────────────────────────────────────────
document.getElementById('back-from-templates').addEventListener('click', () => { populateTemplateSelect(); showScreen('home'); });

function renderTemplatesList() {
  const list = document.getElementById('templates-list');
  list.innerHTML = '';
  getAllTemplates().forEach(t => {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `
      <div class="template-header" data-id="${t.id}">
        <span class="template-name">${t.name}</span>
        <div style="display:flex;align-items:center;gap:8px;">
          ${t.isDefault ? '<span class="tag">Default</span>' : `<button class="delete-btn" data-id="${t.id}">Delete</button>`}
          <span style="color:#94a3b8;font-size:11px;">▼</span>
        </div>
      </div>
      <pre class="template-preview" data-id="${t.id}">${t.content}</pre>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.template-header').forEach(h => {
    h.addEventListener('click', () => {
      const pre = list.querySelector('.template-preview[data-id="' + h.dataset.id + '"]');
      pre.classList.toggle('open');
    });
  });

  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Delete this template?')) {
        deleteCustomTemplate(btn.dataset.id);
        renderTemplatesList();
      }
    });
  });
}

document.getElementById('save-template-btn').addEventListener('click', () => {
  const name = document.getElementById('new-template-name').value.trim();
  const content = document.getElementById('new-template-content').value.trim();
  if (!name || !content) return alert('Please enter a name and template content.');
  saveCustomTemplate(name, content);
  document.getElementById('new-template-name').value = '';
  document.getElementById('new-template-content').value = '';
  renderTemplatesList();
});

// ── Init ─────────────────────────────────────────────────────────────────────
populateTemplateSelect();
showScreen('home');
