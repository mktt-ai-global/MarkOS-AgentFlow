import asyncio
import logging
from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from app.db.session import get_session_factory
from app.models.task import Task
from app.models.agent import Agent

logger = logging.getLogger(__name__)

class OrchestratorService:
    def __init__(self, check_interval: int = 5):
        self.check_interval = check_interval
        self.running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        if self.running:
            return
        logger.info("Starting Orchestrator Service...")
        self.running = True
        self._task = asyncio.create_task(self._loop())

    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Orchestrator Service stopped.")

    async def _loop(self):
        while self.running:
            try:
                await self.process_tasks()
            except Exception as e:
                logger.error(f"Error in orchestrator loop: {e}")
            await asyncio.sleep(self.check_interval)

    async def process_tasks(self):
        session_factory = get_session_factory()
        with session_factory() as db:
            # 1. Find pending tasks
            statement = select(Task).where(Task.status == "pending")
            pending_tasks = db.exec(statement).all()
            
            for task in pending_tasks:
                # Logic to check dependencies (if any)
                # For now, just move to ready if an agent is available
                await self.assign_agent(db, task)

    async def assign_agent(self, db: Session, task: Task):
        # Simple agent assignment logic: find an idle agent of correct type
        # (This would be more complex in a real system)
        statement = select(Agent).where(Agent.status == "idle")
        agent = db.exec(statement).first()
        
        if agent:
            task.agent_id = agent.id
            task.status = "assigned"
            agent.status = "busy"
            db.add(task)
            db.add(agent)
            db.commit()
            logger.info(f"Assigned task {task.id} to agent {agent.id}")
            # In a real system, we would trigger the agent-worker here
            # For now, let's just simulate it moving to in_progress
            task.status = "in_progress"
            db.add(task)
            db.commit()

orchestrator = OrchestratorService()
