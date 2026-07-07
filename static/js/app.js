const tones = window.TONES || [];
const audiences = window.AUDIENCES || [];

const toneDescriptions = {
  formal: "Precise, polished, and professional.",
  casual: "Warm, plainspoken, and easygoing.",
  "child-friendly": "Simple, upbeat, and easy to understand.",
  "executive summary": "Concise, strategic, and decision-ready.",
};

const audienceDescriptions = {
  "general audience": "Broad, accessible language.",
  customers: "Helpful, clear, and benefit-oriented.",
  students: "Engaging, structured, and easy to follow.",
  executives: "Efficient, high-signal, and concise.",
  children: "Simple, friendly, and concrete.",
};

const state = {
  toneIndex: 0,
  audienceIndex: 0,
};

const sourceText = document.getElementById("sourceText");
const lengthSlider = document.getElementById("lengthSlider");
const formalitySlider = document.getElementById("formalitySlider");
const lengthValue = document.getElementById("lengthValue");
const formalityValue = document.getElementById("formalityValue");
const toneSlider = document.getElementById("toneSlider");
const audienceSlider = document.getElementById("audienceSlider");
const toneLabel = document.getElementById("toneLabel");
const toneDescription = document.getElementById("toneDescription");
const audienceLabel = document.getElementById("audienceLabel");
const audienceDescription = document.getElementById("audienceDescription");
const rewriteBtn = document.getElementById("rewriteBtn");
const statusBar = document.getElementById("statusBar");
const resultsPanel = document.getElementById("resultsPanel");
const selectedRewrite = document.getElementById("selectedRewrite");
const selectedMeta = document.getElementById("selectedMeta");
const comparisonView = document.getElementById("comparisonView");
const driftView = document.getElementById("driftView");

function updateSliderLabels() {
  lengthValue.textContent = lengthSlider.value;
  formalityValue.textContent = formalitySlider.value;
}

function syncResultsVisibility() {
  const hasText = sourceText.value.trim().length > 0;
  resultsPanel.classList.toggle("is-hidden", !hasText);
  rewriteBtn.disabled = !hasText;
  if (!hasText) {
    statusBar.textContent = "Add source text to reveal the comparison and drift results.";
  }
}

function renderDial() {
  const tone = tones[state.toneIndex];
  const audience = audiences[state.audienceIndex];

  toneLabel.textContent = tone;
  toneDescription.textContent = toneDescriptions[tone] || "A distinct rewrite style.";
  audienceLabel.textContent = audience;
  audienceDescription.textContent = audienceDescriptions[audience] || "A specific reader profile.";

  toneSlider.value = String(state.toneIndex);
  audienceSlider.value = String(state.audienceIndex);
  selectedMeta.textContent = `${tone} · ${audience}`;
}

function cycleTone(direction = 1) {
  state.toneIndex = (state.toneIndex + direction + tones.length) % tones.length;
  renderDial();
}

function cycleAudience(direction = 1) {
  state.audienceIndex = (state.audienceIndex + direction + audiences.length) % audiences.length;
  renderDial();
}

function renderComparison(comparison, sourceTextValue) {
  const preserved = comparison.meaning_preserved !== false;
  const confidence = typeof comparison.confidence === "number" ? Math.round(comparison.confidence * 100) : 80;
  const changes = Array.isArray(comparison.key_changes) ? comparison.key_changes.join(" • ") : comparison.key_changes || "Tone and structure adjusted while keeping the core meaning.";

  comparisonView.innerHTML = `
    <div class="badge ${preserved ? "ok" : "warn"}">${preserved ? "Meaning preserved" : "Possible drift"}</div>
    <p><strong>Verdict:</strong> ${comparison.verdict || "Rewrite stays close to the source."}</p>
    <p><strong>Confidence:</strong> ${confidence}%</p>
    <p><strong>Key changes:</strong> ${changes}</p>
    <p><strong>Source focus:</strong> ${sourceTextValue.slice(0, 180)}${sourceTextValue.length > 180 ? "..." : ""}</p>
  `;
}

function renderDrift(backTranslation) {
  const drift = Number(backTranslation.drift_score ?? 0.2);
  const flagged = Boolean(backTranslation.drift_flag);
  const percent = Math.round(drift * 100);
  driftView.innerHTML = `
    <div class="badge ${flagged ? "warn" : "ok"}">${flagged ? "Drift flagged" : "Within range"}</div>
    <p><strong>Back-translation:</strong> ${backTranslation.back_translation || "No back-translation returned."}</p>
    <p><strong>Drift score:</strong> ${percent}%</p>
    <p>${backTranslation.explanation || "Meaning remains close to the source."}</p>
  `;
}

async function rewrite() {
  const text = sourceText.value.trim();
  if (!text) {
    statusBar.textContent = "Add some source text first.";
    sourceText.focus();
    return;
  }

  rewriteBtn.disabled = true;
  statusBar.textContent = "Generating rewrites, comparison, and drift analysis...";

  try {
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        tone: tones[state.toneIndex],
        audience: audiences[state.audienceIndex],
        length: Number(lengthSlider.value),
        formality: Number(formalitySlider.value),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Rewrite request failed.");
    }

    const activeRewrite = data.rewrite || {};
    selectedRewrite.textContent = activeRewrite.text || "No rewrite returned.";
    selectedMeta.textContent = `${activeRewrite.tone || tones[state.toneIndex]} · ${activeRewrite.audience || audiences[state.audienceIndex]}`;
    renderComparison(data.comparison || {}, text);
    renderDrift(data.back_translation || {});

    statusBar.textContent = "Rewrite complete. Compare the variants below and review the drift signal.";
  } catch (error) {
    statusBar.textContent = error.message;
  } finally {
    rewriteBtn.disabled = false;
  }
}

toneSlider.addEventListener("input", (event) => {
  state.toneIndex = Number(event.target.value);
  renderDial();
});
audienceSlider.addEventListener("input", (event) => {
  state.audienceIndex = Number(event.target.value);
  renderDial();
});
rewriteBtn.addEventListener("click", rewrite);
lengthSlider.addEventListener("input", updateSliderLabels);
formalitySlider.addEventListener("input", updateSliderLabels);
sourceText.addEventListener("input", syncResultsVisibility);

updateSliderLabels();
renderDial();
selectedRewrite.textContent = "Your chosen rewrite will appear here.";
syncResultsVisibility();
