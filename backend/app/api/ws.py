from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.deps import DbSession
from app.schemas.realtime import WorkspaceRealtimeMessage
from app.services.realtime import WorkspaceSnapshotService

router = APIRouter(prefix="/ws", tags=["realtime"])


@router.websocket("/workspace")
async def workspace_stream(websocket: WebSocket, session: DbSession) -> None:
    await websocket.accept()
    previous_fingerprint = ""

    try:
        while True:
            session.expire_all()
            snapshot = WorkspaceSnapshotService(session).build_snapshot()
            message = WorkspaceRealtimeMessage(payload=snapshot)
            payload = message.model_dump(mode="json")
            fingerprint_source = {
                "tasks": payload["payload"]["tasks"],
                "agents": payload["payload"]["agents"],
                "teams": payload["payload"]["teams"],
                "skills": payload["payload"]["skills"],
                "dashboard_stats": payload["payload"]["dashboard_stats"],
            }
            fingerprint = json.dumps(fingerprint_source, ensure_ascii=False, sort_keys=True)

            if fingerprint != previous_fingerprint:
                await websocket.send_json(payload)
                previous_fingerprint = fingerprint

            await asyncio.sleep(0.8)
    except WebSocketDisconnect:
        return
