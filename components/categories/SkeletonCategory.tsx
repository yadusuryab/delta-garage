export default function SkeletonCategory() {
    return (
      <div className="shrink-0 w-[280px] h-[180px] md:w-[300px] md:h-[200px] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse overflow-hidden">
        <div className="h-full flex flex-col p-6 justify-end">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 mb-3" />
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }