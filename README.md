# ToneShift: Audience-Aware Rewriter

A Flask + Groq app that rewrites text for a chosen tone and audience, then checks meaning preservation with comparison and back-translation.

![ToneShift demo](toneshift%20demo.png)

## Features

- Tone and audience sliders.
- One focused rewrite per request.
- Length and formality sliders.
- Compact comparison and drift checks.

## Setup

1. Create and activate a Python virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and add your Groq API key.
4. Run `python run.py` for local development.

## Notes

- The app expects `GROQ_API_KEY` in `.env`.
- Default model: `llama-3.3-70b-versatile`.
