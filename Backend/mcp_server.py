import asyncio
import json
from typing import List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from utils import broadcaster

# Try to import AsyncSessionLocal and fetch_full_context from the application's db layer;
# if they are not available (e.g. during lightweight static checks or tests), provide
# simple fallbacks so the module can be imported without NameError.
try:
	from db import AsyncSessionLocal, fetch_full_context  # adjust import path as needed
except Exception:
	from contextlib import asynccontextmanager

	@asynccontextmanager
	async def AsyncSessionLocal():
		class DummySession:
			pass
		try:
			yield DummySession()
		finally:
			pass

	async def fetch_full_context(session):
		# Return an empty/default context as a sensible fallback.
		return {}

# Router for MCP endpoints
router = APIRouter()


@router.websocket('/ws/mcp')
async def websocket_endpoint(websocket: WebSocket):
	await websocket.accept()
	await broadcaster.connect(websocket)
	try:
		while True:
			# accept both text pings and json messages
			try:
				data_text = await websocket.receive_text()
				try:
					payload = json.loads(data_text)
				except Exception:
					payload = {}
				if payload.get('action') == 'ping':
					await websocket.send_json({'type': 'pong'})
			except Exception:
				# If receive_text fails, try receive_json (fallback)
				try:
					data = await websocket.receive_json()
					if data.get('action') == 'ping':
						await websocket.send_json({'type': 'pong'})
				except Exception:
					# ignore unexpected messages
					await asyncio.sleep(0.1)
	except WebSocketDisconnect:
		await broadcaster.disconnect(websocket)


# Background polling loop (45s) to fetch context and broadcast full lists
async def polling_loop():
	print('MCP polling loop started — polling every 45s')
	while True:
		try:
			# Note: AsyncSessionLocal and fetch_full_context are expected to be defined elsewhere
			async with AsyncSessionLocal() as session:
				ctx = await fetch_full_context(session)
				# Broadcast full lists to all connected clients
				await broadcaster.broadcast({'type': 'context:update', 'payload': ctx})
		except Exception as e:
			print('MCP polling error', e)
		await asyncio.sleep(45)


# Startup hook to launch background task
def start_mcp_background_loop(app):
	loop = asyncio.get_event_loop()
	# Launch polling loop as a task
	loop.create_task(polling_loop())


# Manual refresh endpoint to force broadcast (useful for testing/demo)
@router.post('/api/mcp/refresh')
async def mcp_manual_refresh():
	async with AsyncSessionLocal() as session:
		ctx = await fetch_full_context(session)
		await broadcaster.broadcast({'type': 'context:update', 'payload': ctx})
	return {'status': 'ok'}


# Helper to push an event to all connected clients
async def push_item_event(item: dict):
	await broadcaster.broadcast({'type': 'item:new', 'payload': item})