import { useMemo, useState } from "react";
import AgentComposer from "../components/AgentComposer";
import EmptyState from "../components/EmptyState";
import SkillComposer from "../components/SkillComposer";
import TeamComposer from "../components/TeamComposer";
import {
  SKILL_LIBRARY,
  TEAM_ASSIGNMENTS,
  TEAM_CARD_STATS,
  TEAM_GROUPS,
  TEAM_GUIDANCE,
  TEAM_ROSTER,
  TEAM_SKILL_COVERAGE
} from "../data/workspace";
import { filterByQuery, getSearchMeta } from "../lib/search";
import { buildTeamView } from "../lib/runtime-view";
import { useDashboardStore } from "../stores/dashboardStore";
import { useRuntimeStore } from "../stores/runtimeStore";

export default function TeamPage() {
  const [isAgentComposerOpen, setIsAgentComposerOpen] = useState(false);
  const [isTeamComposerOpen, setIsTeamComposerOpen] = useState(false);
  const [isSkillComposerOpen, setIsSkillComposerOpen] = useState(false);

  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const tasks = useRuntimeStore((state) => state.tasks);
  const agents = useRuntimeStore((state) => state.agents);
  const teams = useRuntimeStore((state) => state.teams);
  const skills = useRuntimeStore((state) => state.skills);
  const dashboardStats = useRuntimeStore((state) => state.dashboardStats);
  const hasLoadedRemote = useRuntimeStore((state) => state.hasLoadedRemote);
  const createAgent = useRuntimeStore((state) => state.createAgent);
  const createTeam = useRuntimeStore((state) => state.createTeam);
  const createSkill = useRuntimeStore((state) => state.createSkill);
  const isCreatingAgent = useRuntimeStore((state) => state.isCreatingAgent);
  const createAgentError = useRuntimeStore((state) => state.createAgentError);
  const isCreatingTeam = useRuntimeStore((state) => state.isCreatingTeam);
  const createTeamError = useRuntimeStore((state) => state.createTeamError);
  const isCreatingSkill = useRuntimeStore((state) => state.isCreatingSkill);
  const createSkillError = useRuntimeStore((state) => state.createSkillError);

  const runtimeView = useMemo(() => {
    if (!hasLoadedRemote || !dashboardStats) {
      return null;
    }

    return buildTeamView(tasks, agents, teams, skills, dashboardStats);
  }, [agents, dashboardStats, hasLoadedRemote, skills, tasks, teams]);

  const teamCardStats = runtimeView?.teamCardStats ?? TEAM_CARD_STATS;
  const roster = runtimeView?.roster ?? TEAM_ROSTER;
  const teamGroups = runtimeView?.teamGroups ?? TEAM_GROUPS;
  const skillLibrary = runtimeView?.skillLibrary ?? SKILL_LIBRARY;
  const assignments = runtimeView?.assignments ?? TEAM_ASSIGNMENTS;
  const skillCoverage = runtimeView?.skillCoverage ?? TEAM_SKILL_COVERAGE;
  const guidance = runtimeView?.guidance ?? TEAM_GUIDANCE;
  const slotCount = runtimeView?.slotCount ?? "2";

  const filteredRoster = filterByQuery(roster, searchQuery, (item) => [
    item.name,
    item.meta,
    item.status
  ]);
  const filteredTeams = filterByQuery(teamGroups, searchQuery, (item) => [
    item.name,
    item.focus,
    item.description,
    item.members
  ]);
  const filteredSkillLibrary = filterByQuery(skillLibrary, searchQuery, (item) => [
    item.name,
    item.category,
    item.description,
    item.hint
  ]);
  const filteredAssignments = filterByQuery(assignments, searchQuery, (item) => [
    item.name,
    item.meta,
    item.badge,
    item.time
  ]);
  const filteredGuidance = filterByQuery(guidance, searchQuery, (item) => [
    item.title,
    item.description
  ]);

  return (
    <div className="page-stack">
      <AgentComposer
        open={isAgentComposerOpen}
        isSubmitting={isCreatingAgent}
        error={createAgentError}
        skills={skills}
        teams={teams}
        onClose={() => setIsAgentComposerOpen(false)}
        onSubmit={createAgent}
      />

      <TeamComposer
        open={isTeamComposerOpen}
        isSubmitting={isCreatingTeam}
        error={createTeamError}
        agents={agents}
        onClose={() => setIsTeamComposerOpen(false)}
        onSubmit={createTeam}
      />

      <SkillComposer
        open={isSkillComposerOpen}
        isSubmitting={isCreatingSkill}
        error={createSkillError}
        onClose={() => setIsSkillComposerOpen(false)}
        onSubmit={createSkill}
      />

      <div className="row r4">
        {teamCardStats.map((card) => (
          <div key={card.title} className={`card ${card.tone}`}>
            <div className="acl" />
            <div className="ch">
              <div className={`aico ${card.iconTone}`}>{card.icon}</div>
              <div>
                <div className="cn">{card.title}</div>
                <div className="cr">{card.subtitle}</div>
              </div>
              <div className={`pill ${card.pillTone}`}>{card.pill}</div>
            </div>
            <div className="metric">{card.metric}</div>
            <div className="mlabel">{card.metricLabel}</div>
            <div className="msub">{card.metricSub}</div>
          </div>
        ))}

        <div className="pcard">
          <div className="pav">团</div>
          <div className="pname">Agent 团队</div>
          <div className="prole">管理中枢</div>
          <div className="pst">{slotCount}</div>
          <div className="pstl">当前团队数量</div>
          <div className="team-pcard-actions">
            <button className="pbtn" type="button" onClick={() => setIsAgentComposerOpen(true)}>
              新增成员 →
            </button>
            <button className="pbtn" type="button" onClick={() => setIsTeamComposerOpen(true)}>
              创建团队 →
            </button>
            <button className="pbtn" type="button" onClick={() => setIsSkillComposerOpen(true)}>
              新增 Skill →
            </button>
          </div>
        </div>
      </div>

      <div className="row rmid">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">当前分工</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredRoster.length, "角色视图")}
            </div>
          </div>
          {filteredRoster.length ? (
            <div className="aclist">
              {filteredRoster.map((item) => (
                <div key={item.name} className="aci">
                  <div className={`aico ${item.tone}`}>{item.icon}</div>
                  <div className="ti-info">
                    <div className="ti-n">{item.name}</div>
                    <div className="ti-m">{item.meta}</div>
                  </div>
                  <div className={`lp ${item.statusTone}`}>
                    <span className={`ld${item.pulse ? " pulse" : ""}`} />
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="团队分工里没有匹配项"
              description="可以搜索角色名称、职责说明或状态。"
            />
          )}
        </div>

        <div className="statcol">
          {skillCoverage.map((item) => (
            <div key={item.title} className="sp">
              <div className="sph">
                <span className="spt">{item.title}</span>
                <div className={`lp ${item.statusTone}`}>
                  <span className={`ld${item.pulse ? " pulse" : ""}`} />
                  {item.status}
                </div>
              </div>
              <div className="bign">
                {item.value}
                {item.unit ? <span>{item.unit}</span> : null}
              </div>
              <div className="token-meta">{item.meta}</div>
              <div className="bt token-bar">
                <div
                  className="bf"
                  style={{ width: item.width, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-grid-2">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">团队编组</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredTeams.length, "Team Library")}
            </div>
          </div>
          {filteredTeams.length ? (
            <div className="stack-note-list">
              {filteredTeams.map((team) => (
                <div key={team.name} className={`stack-note team-note ${team.tone}`}>
                  <div className="team-note-top">
                    <strong>{team.name}</strong>
                    <span className={`tsm ${team.tone}`}>{team.memberCount}</span>
                  </div>
                  <span className="team-note-focus">{team.focus}</span>
                  <span>{team.description}</span>
                  <span className="team-note-members">{team.members}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="当前没有匹配的团队"
              description="可以搜索团队名称、焦点方向或成员名称。"
            />
          )}
        </div>

        <div className="panel">
          <div className="ph">
            <div className="ptitle">Skills 库</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredSkillLibrary.length, "Shared Library")}
            </div>
          </div>
          {filteredSkillLibrary.length ? (
            <div className="skill-library-list">
              {filteredSkillLibrary.map((skill) => (
                <div key={skill.name} className="skill-library-item">
                  <div className={`oico ${skill.tone}`}>{skill.core ? "★" : "•"}</div>
                  <div className="oi-info">
                    <div className="oi-n">{skill.name}</div>
                    <div className="oi-m">{skill.description}</div>
                    <div className="skill-library-hint">{skill.hint}</div>
                  </div>
                  <span className="ois ois-size">{skill.category}</span>
                  <span className={`ois ois-time${skill.core ? " ois-highlight" : ""}`}>
                    {skill.usage}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="Skills 库里没有匹配项"
              description="可以搜索 Skill 名称、类别或使用说明。"
            />
          )}
        </div>
      </div>

      <div className="page-grid-2">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">任务占用情况</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredAssignments.length, "负载视图")}
            </div>
          </div>
          {filteredAssignments.length ? (
            <div className="tl">
              {filteredAssignments.map((item) => (
                <div key={item.name} className="ti">
                  <div className={`sd ${item.state}`} />
                  <div className="ti-info">
                    <div className="ti-n">{item.name}</div>
                    <div className="ti-m">{item.meta}</div>
                  </div>
                  <span className={`tsm ${item.tone}`}>{item.badge}</span>
                  <span className="tt">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="任务占用列表里没有匹配项"
              description="可以搜索 Agent、链路说明或当前阶段。"
            />
          )}
        </div>

        <div className="panel">
          <div className="ph">
            <div className="ptitle">协作提示</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredGuidance.length, "扩容建议")}
            </div>
          </div>
          {filteredGuidance.length ? (
            <div className="stack-note-list">
              {filteredGuidance.map((item) => (
                <div key={item.title} className="stack-note">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="协作建议里没有匹配项"
              description="可以搜索角色名、负载提示或扩容方向。"
            />
          )}
        </div>
      </div>
    </div>
  );
}
