from pydantic import BaseModel
from typing import Optional, List
import datetime


class AttachmentOut(BaseModel):
	id: int
	name: str
	mime_type: Optional[str]
	url: Optional[str]


class MessageOut(BaseModel):
	id: int
	source: str
	external_id: str
	title: Optional[str]
	snippet: Optional[str]
	message_type: Optional[str]
	due_datetime: Optional[datetime.datetime]
	attachments: List[AttachmentOut] = []


# -------------------------------------------------------------------------
# File: utils.py
# -------------------------------------------------------------------------
import os
import time
import json
from datetime import datetime, timedelta


def now_plus(minutes=0):
	return datetime.utcnow() + timedelta(minutes=minutes)


# Basic date parsing helpers could go here


# Simple in-memory store for demo pubsub
class SimpleBroadcaster:
	def __init__(self):
		self.connections = set()


	async def connect(self, websocket):
		self.connections.add(websocket)


	async def disconnect(self, websocket):
		self.connections.remove(websocket)


	async def broadcast(self, message: dict):
		import json
		living = set()
		for ws in list(self.connections):
			try:
				await ws.send_json(message)
				living.add(ws)
			except Exception:
				pass
		self.connections = living


broadcaster = SimpleBroadcaster()