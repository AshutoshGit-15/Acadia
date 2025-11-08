from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from auth import router as auth_router
from mcp_server import router as mcp_router, start_mcp_background_loop

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title='Collegiate Inbox Navigator - Backend')

app.include_router(auth_router)
app.include_router(mcp_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # MCP Background Poll Loop Auto start
    start_mcp_background_loop(app)


@app.get('/health')
async def health():
    return {'status':'ok'}


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
