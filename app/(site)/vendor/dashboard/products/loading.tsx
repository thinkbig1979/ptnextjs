export default function ProductManagementLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-10 bg-muted rounded w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
            <div className="h-16 w-16 bg-muted rounded" />
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
            <div className="h-8 bg-muted rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
