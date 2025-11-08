from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
import datetime


Base = declarative_base()


class User(Base):
	__tablename__ = 'users'
	id = Column(Integer, primary_key=True, index=True)
	google_id = Column(String, unique=True, index=True)
	email = Column(String, unique=True, index=True)
	display_name = Column(String)
	access_token = Column(String)
	refresh_token = Column(String)
	token_expires_at = Column(DateTime)


class Course(Base):
	__tablename__ = 'courses'
	id = Column(Integer, primary_key=True, index=True)
	course_id = Column(String, index=True) # e.g., Google Classroom course ID
	name = Column(String)


class MessageItem(Base):
	__tablename__ = 'messages'
	id = Column(Integer, primary_key=True, index=True)
	source = Column(String) # 'gmail' or 'classroom'
	external_id = Column(String, index=True)
	course_id = Column(Integer, ForeignKey('courses.id'), nullable=True)
	title = Column(String)
	snippet = Column(Text)
	body = Column(Text)
	message_type = Column(String)
	due_datetime = Column(DateTime, nullable=True)
	created_at = Column(DateTime, default=datetime.datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.datetime.utcnow)
	attachments = relationship('Attachment', back_populates='message')


class Attachment(Base):
	__tablename__ = 'attachments'
	id = Column(Integer, primary_key=True, index=True)
	message_id = Column(Integer, ForeignKey('messages.id'))
	name = Column(String)
	mime_type = Column(String)
	drive_file_id = Column(String, nullable=True) # if hosted on Drive
	url = Column(String, nullable=True)
	message = relationship('MessageItem', back_populates='attachments')