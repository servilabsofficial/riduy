export function SkeletonCard() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-32 rounded" />
        </div>
        <div className="skeleton h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="skeleton h-8 w-48 rounded" />
      </div>
      <table className="w-full">
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
              {[...Array(cols)].map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
