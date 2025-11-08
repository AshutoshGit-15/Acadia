from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


SCOPES_CLASSROOM = [
'https://www.googleapis.com/auth/classroom.courses.readonly',
'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
'https://www.googleapis.com/auth/classroom.announcements.readonly'
]


def build_classroom_service(access_token, refresh_token=None, token_uri='https://oauth2.googleapis.com/token', client_id=None, client_secret=None):
	creds = Credentials(token=access_token, refresh_token=refresh_token, token_uri=token_uri, client_id=client_id, client_secret=client_secret, scopes=SCOPES_CLASSROOM)
	service = build('classroom', 'v1', credentials=creds)
	return service


async def list_courses(creds):
	service = build_classroom_service(**creds)
	results = service.courses().list(pageSize=50).execute()
	return results.get('courses', [])


async def list_course_work(creds, course_id):
	service = build_classroom_service(**creds)
	results = service.courses().courseWork().list(courseId=course_id, pageSize=50).execute()
	return results.get('courseWork', [])