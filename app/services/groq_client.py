from groq import Groq


def build_groq_client(api_key: str) -> Groq:
    if not api_key:
        raise ValueError("GROQ_API_KEY is required.")
    return Groq(api_key=api_key)
