from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import base64
from email import message_from_bytes


SCOPES_GMAIL = ['https://www.googleapis.com/auth/gmail.readonly']


def build_gmail_service(access_token, refresh_token=None, token_uri='https://oauth2.googleapis.com/token', client_id=None, client_secret=None):
	creds = Credentials(token=access_token, refresh_token=refresh_token, token_uri=token_uri, client_id=client_id, client_secret=client_secret, scopes=SCOPES_GMAIL)
	service = build('gmail', 'v1', credentials=creds)
	return service


async def fetch_recent_inbox_messages(creds):
	service = build_gmail_service(**creds)
	results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=25).execute()
	messages = results.get('messages', [])
	out = []
	for m in messages:
		msg = service.users().messages().get(userId='me', id=m['id'], format='full').execute()
		snippet = msg.get('snippet')
		out.append({'id': msg['id'], 'snippet': snippet})
	return out