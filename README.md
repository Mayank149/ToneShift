# ToneShift: Audience-Aware Rewriter

A Flask + Groq app that rewrites one input text into multiple tones, compares the result against the source, and flags meaning drift with a back-translation check.

## Features

- Four tone variants from a single source input.
- Tone and audience rotary selectors.
- Length and formality sliders.
- Comparison panel for meaning preservation.
- Back-translation drift check.

## Setup

1. Create and activate a Python virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and add your Groq API key.
4. Run `python run.py`.

## Notes

- The app expects `GROQ_API_KEY` in `.env`.
- Default model: `llama-3.3-70b-versatile`.
