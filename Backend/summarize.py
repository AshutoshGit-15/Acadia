import os
from dotenv import load_dotenv
try:
	import openai
except ImportError:
	openai = None
import asyncio

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if openai is not None:
	openai.api_key = OPENAI_API_KEY

async def summarize_text(text: str, max_sentences: int = 3) -> str:
	if openai is None:
		raise ImportError("The 'openai' package is not installed. Install it with: pip install openai python-dotenv")
	prompt = f"You are an assistant. Produce a concise {max_sentences}-sentence summary of the following professor email, listing main points and action items. Keep it short and actionable.\n\nEmail:\n{text}"
	resp = await asyncio.to_thread(
		openai.ChatCompletion.create,
		model='gpt-4o-mini',
		messages=[{"role": "user", "content": prompt}],
		max_tokens=200,
		temperature=0.2,
	)
	# For compatibility, prefer 'choices' parsing
	summary = resp['choices'][0]['message']['content'].strip()
	return summary