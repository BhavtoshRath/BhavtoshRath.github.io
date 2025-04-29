export default function CategoryTag({ name }: { name: string }) {
  return (
    <span className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 mb-2">
      {name}
    </span>
  );
} 