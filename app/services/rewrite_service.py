import json
from dataclasses import dataclass
from typing import Any

from .groq_client import build_groq_client

TONES = [
    "formal",
    "casual",
    "child-friendly",
    "executive summary",
]

AUDIENCES = [
    "general audience",
    "customers",
    "students",
    "executives",
    "children",
]


@dataclass
class RewriteResult:
    tone: str
    audience: str
    text: str
    length_note: str
    formality_score: int


class RewriteService:
    def __init__(self, api_key: str, model: str) -> None:
        self.client = build_groq_client(api_key)
        self.model = model

    def generate_bundle(
        self,
        source_text: str,
        tone: str,
        audience: str,
        length: int,
        formality: int,
    ) -> dict[str, Any]:
        rewrite = self._generate_single_rewrite(
            source_text=source_text,
            tone=tone,
            audience=audience,
            length=length,
            formality=formality,
        )
        comparison = self._generate_comparison(source_text, rewrite["text"], tone, audience)
        back_translation = self._generate_back_translation_check(source_text, rewrite["text"])

        return {
            "source_text": source_text,
            "selected_tone": tone,
            "selected_audience": audience,
            "rewrite": rewrite,
            "comparison": comparison,
            "back_translation": back_translation,
        }

    def _generate_single_rewrite(
        self,
        source_text: str,
        tone: str,
        audience: str,
        length: int,
        formality: int,
    ) -> dict[str, Any]:
        prompt = f"""
Rewrite the text in a {tone} tone for a {audience}.
Keep the meaning faithful and avoid adding facts.
Length target slider: {length}/100. Formality slider: {formality}/100.
Return valid JSON with keys: tone, audience, text, length_note, formality_score.
The text should be polished, convincing, and concise where appropriate.

Source text:
{source_text}
""".strip()

        payload = self._run_json_prompt(prompt)
        payload.setdefault("tone", tone)
        payload.setdefault("audience", audience)
        payload.setdefault("length_note", self._length_note(length))
        payload.setdefault("formality_score", formality)
        return payload

    def _generate_comparison(self, source_text: str, rewrite_text: str, tone: str, audience: str) -> dict[str, Any]:
        prompt = f"""
Compare the source and rewritten text for meaning preservation.
Assess whether the rewrite stays faithful to the source while changing tone for a {audience}.
Return valid JSON with keys: meaning_preserved, confidence, key_changes, verdict, drift_risk.
Keep the answer short and specific.

Source text:
{source_text}

Rewritten text:
{rewrite_text}
""".strip()
        payload = self._run_json_prompt(prompt)
        payload.setdefault("meaning_preserved", True)
        payload.setdefault("confidence", 0.8)
        payload.setdefault("verdict", f"Checked {tone} rewrite for audience fit.")
        payload.setdefault("drift_risk", "low")
        return payload

    def _generate_back_translation_check(self, source_text: str, rewrite_text: str) -> dict[str, Any]:
        prompt = f"""
Back-translate the rewritten text into plain neutral English and compare it to the source.
Return valid JSON with keys: back_translation, drift_flag, drift_score, explanation.
Set drift_flag to true if meaning changes too far from the source.

Source text:
{source_text}

Rewritten text:
{rewrite_text}
""".strip()
        payload = self._run_json_prompt(prompt)
        payload.setdefault("drift_flag", False)
        payload.setdefault("drift_score", 0.2)
        payload.setdefault("explanation", "Meaning remains close to the source.")
        return payload

    def _run_json_prompt(self, prompt: str) -> dict[str, Any]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a precise rewriting and analysis engine. Output only JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)

    def _length_note(self, length: int) -> str:
        if length < 35:
            return "short and compact"
        if length < 70:
            return "balanced length"
        return "expanded and detailed"
