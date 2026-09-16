type ScoreCardProps = {
  title: string;
  score: number;
};

export default function ScoreCard({
  title,
  score,
}: ScoreCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p
        className="mt-2 text-4xl font-bold text-blue-600"
        aria-label={`${title}: ${score} out of 100`}
      >
        {score}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        out of 100
      </p>
    </div>
  );
}