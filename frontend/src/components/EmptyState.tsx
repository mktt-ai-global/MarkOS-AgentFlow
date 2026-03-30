type EmptyStateProps = {
  title: string;
  description: string;
  compact?: boolean;
};

export default function EmptyState({
  title,
  description,
  compact = false
}: EmptyStateProps) {
  return (
    <div className={`empty-state${compact ? " compact" : ""}`}>
      <div className="empty-state-kicker">搜索结果</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-copy">{description}</div>
    </div>
  );
}
