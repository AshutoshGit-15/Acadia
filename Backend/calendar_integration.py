from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


SCOPES_CAL = ['https://www.googleapis.com/auth/calendar.events']


def build_calendar_service(access_token, refresh_token=None, token_uri='https://oauth2.googleapis.com/token', client_id=None, client_secret=None):
	creds = Credentials(token=access_token, refresh_token=refresh_token, token_uri=token_uri, client_id=client_id, client_secret=client_secret, scopes=SCOPES_CAL)
	service = build('calendar', 'v3', credentials=creds)
	return service


async def insert_event(creds, calendar_event):
	service = build_calendar_service(**creds)
	event = service.events().insert(calendarId='primary', body=calendar_event).execute()
	return event