import { useMemo } from "react";
import EmptyState from "../components/EmptyState";
import { MESSAGE_SUMMARY, MESSAGE_THREADS, THREAD_MESSAGES } from "../data/workspace";
import { filterByQuery, getSearchMeta } from "../lib/search";
import { buildMessagesView } from "../lib/runtime-view";
import { useDashboardStore } from "../stores/dashboardStore";
import { useRuntimeStore } from "../stores/runtimeStore";

export default function MessagesPage() {
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const tasks = useRuntimeStore((state) => state.tasks);
  const dashboardStats = useRuntimeStore((state) => state.dashboardStats);
  const hasLoadedRemote = useRuntimeStore((state) => state.hasLoadedRemote);

  const runtimeView = useMemo(() => {
    if (!hasLoadedRemote || !dashboardStats) {
      return null;
    }

    return buildMessagesView(tasks, dashboardStats);
  }, [dashboardStats, hasLoadedRemote, tasks]);

  const threads = runtimeView?.threads ?? MESSAGE_THREADS;
  const messages = runtimeView?.messages ?? THREAD_MESSAGES;
  const summary = runtimeView?.summary ?? MESSAGE_SUMMARY;

  const filteredThreads = filterByQuery(threads, searchQuery, (thread) => [
    thread.title,
    thread.preview,
    thread.time
  ]);
  const filteredMessages = filterByQuery(messages, searchQuery, (message) => [
    message.author,
    message.content,
    message.time
  ]);

  return (
    <div className="page-stack">
      <div className="messages-grid">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">消息线程</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredThreads.length, "5 未读")}
            </div>
          </div>
          {filteredThreads.length ? (
            <div className="thread-list">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.title}
                  className={`thread-item${thread.active ? " active" : ""}`}
                >
                  <div className={`thread-avatar ${thread.tone}`}>{thread.avatar}</div>
                  <div className="thread-body">
                    <div className="thread-top">
                      <span className="thread-title">{thread.title}</span>
                      <span className="thread-time">{thread.time}</span>
                    </div>
                    <div className="thread-sub">{thread.preview}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="消息线程里没有匹配项"
              description="可以搜索主题、预览内容或消息时间。"
            />
          )}
        </div>

        <div className="panel message-panel">
          <div className="ph">
            <div className="ptitle">QA 阻塞同步</div>
            <div className="lp on">
              <span className="ld pulse" />
              实时
            </div>
          </div>
          {filteredMessages.length ? (
            <div className="message-stream">
              {filteredMessages.map((message) => (
                <div
                  key={`${message.author}-${message.time}-${message.content}`}
                  className={`msg-bubble ${message.tone}`}
                >
                  <div className="msg-meta">
                    <span>{message.author}</span>
                    <span>{message.time}</span>
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="当前会话里没有匹配项"
              description="可以搜索作者、阻塞说明或处理意见。"
            />
          )}
        </div>
      </div>

      <div className="page-grid-2">
        {summary.map((item) => (
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
              <div className="bf" style={{ width: item.width, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
