from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
try:
    import httpx
except ImportError as e:
    raise ImportError(
        "Missing dependency 'httpx'. Install it with: pip install httpx\n"
        "If using an editor like VSCode, make sure the correct Python interpreter/venv is selected."
    ) from e
import os

router = APIRouter()

SCOPES = [
	'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
	'https://www.googleapis.com/auth/calendar.events',
	'https://www.googleapis.com/auth/drive.readonly',
	'openid',
	'email',
	'profile'
]


GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '<YOUR_CLIENT_ID>')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '<YOUR_CLIENT_SECRET>')
OAUTH_REDIRECT_URI = os.environ.get('OAUTH_REDIRECT_URI', 'http://localhost:8000/auth/callback')

GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
TOKEN_URL = 'https://oauth2.googleapis.com/token'


@router.get('/auth/start')
async def auth_start():
	params = {
		'client_id': GOOGLE_CLIENT_ID,
		'redirect_uri': OAUTH_REDIRECT_URI,
		'response_type': 'code',
		'scope': ' '.join(SCOPES),
		'access_type': 'offline',
		'prompt': 'consent'
	}
	url = f"{GOOGLE_OAUTH_URL}?{urlencode(params)}"
	return RedirectResponse(url)


@router.get('/auth/callback')
async def auth_callback(code: str, request: Request):
	data = {
		'code': code,
		'client_id': GOOGLE_CLIENT_ID,
		'client_secret': GOOGLE_CLIENT_SECRET,
		'redirect_uri': OAUTH_REDIRECT_URI,
		'grant_type': 'authorization_code'
	}
	async with httpx.AsyncClient() as client:
		r = await client.post(TOKEN_URL, data=data)
		token_data = r.json()
	# token_data contains access_token, refresh_token, expires_in
	# After storing tokens in DB, redirect back to frontend
	to_frontend = "http://127.0.0.1:5500/oauth.html"
	return RedirectResponse(to_frontend)