'use client';

interface BadgeListProps {
  badges: string[]; // e.g. ['JavaScript Pro', 'First Quiz']
}

export default function BadgeList({ badges }: BadgeListProps) {
  if (badges.length === 0) {
    return <p className="text-gray-500">No badges earned yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((b, i) => (
        <div
          key={i}
          className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
        >
          {b}
        </div>
      ))}
    </div>
  );
}
