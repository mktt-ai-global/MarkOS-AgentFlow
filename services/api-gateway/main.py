from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import tasks, projects

app = FastAPI(
    title="AgentFlow Enterprise (v2.0) API Gateway",
    description="Main entry point for AgentFlow Enterprise v2.0.",
    version="2.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router, prefix="/v2/tasks", tags=["Tasks"])
app.include_router(projects.router, prefix="/v2/projects", tags=["Projects"])

@app.get("/")
async def root():
    return {"message": "AgentFlow Enterprise v2.0 API Gateway is active."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
