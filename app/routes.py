from flask import Blueprint, current_app, jsonify, render_template, request

from .services.rewrite_service import AUDIENCES, TONES, RewriteService

main_bp = Blueprint("main", __name__)


@main_bp.get("/")
def index():
    return render_template("index.html", tones=TONES, audiences=AUDIENCES)


@main_bp.post("/api/rewrite")
def rewrite():
    payload = request.get_json(silent=True) or {}
    source_text = (payload.get("text") or "").strip()
    if not source_text:
        return jsonify({"error": "Text is required."}), 400

    tone = payload.get("tone") or TONES[0]
    audience = payload.get("audience") or AUDIENCES[0]
    length = int(payload.get("length") or 50)
    formality = int(payload.get("formality") or 50)

    if tone not in TONES:
        tone = TONES[0]
    if audience not in AUDIENCES:
        audience = AUDIENCES[0]

    service = RewriteService(
        api_key=current_app.config["GROQ_API_KEY"],
        model=current_app.config["GROQ_MODEL"],
    )

    result = service.generate_bundle(
        source_text=source_text,
        tone=tone,
        audience=audience,
        length=length,
        formality=formality,
    )
    return jsonify(result)
