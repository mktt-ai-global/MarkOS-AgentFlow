from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0001_phase2_foundation"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None

agent_role_enum = sa.Enum("PM", "DEV", "QA", name="agentrole")
agent_status_enum = sa.Enum("ONLINE", "IDLE", "OFFLINE", name="agentstatus")
task_status_enum = sa.Enum(
    "PENDING",
    "RUNNING",
    "DONE",
    "BLOCKED",
    "FAILED",
    "SKIPPED",
    name="taskstatus",
)


def upgrade() -> None:
    bind = op.get_bind()
    agent_role_enum.create(bind, checkfirst=True)
    agent_status_enum.create(bind, checkfirst=True)
    task_status_enum.create(bind, checkfirst=True)

    op.create_table(
        "agents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("role", agent_role_enum, nullable=False),
        sa.Column("skills", sa.JSON(), nullable=False),
        sa.Column("system_prompt", sa.Text(), nullable=False),
        sa.Column("model", sa.String(length=255), nullable=False),
        sa.Column("max_tokens", sa.Integer(), nullable=False),
        sa.Column("status", agent_status_enum, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_agents_role", "agents", ["role"], unique=False)

    op.create_table(
        "tasks",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("assigned_agent", sa.String(length=16), nullable=False),
        sa.Column("status", task_status_enum, nullable=False),
        sa.Column("depends_on", sa.JSON(), nullable=False),
        sa.Column("handoff_context", sa.JSON(), nullable=False),
        sa.Column("output", sa.JSON(), nullable=False),
        sa.Column("token_used", sa.Integer(), nullable=False),
        sa.Column("retry_count", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tasks_status", "tasks", ["status"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()

    op.drop_index("ix_tasks_status", table_name="tasks")
    op.drop_table("tasks")
    op.drop_index("ix_agents_role", table_name="agents")
    op.drop_table("agents")

    task_status_enum.drop(bind, checkfirst=True)
    agent_status_enum.drop(bind, checkfirst=True)
    agent_role_enum.drop(bind, checkfirst=True)
