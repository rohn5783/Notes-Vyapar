// src/app/notes/loading.jsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c1324] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-96 mx-auto animate-pulse"></div>
        </div>

        <div className="bg-white dark:bg-[#1a2333] p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between h-20 animate-pulse border border-gray-100 dark:border-gray-800">
          <div className="h-10 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-full md:w-1/3"></div>
          <div className="flex gap-4 w-full md:w-auto">
             <div className="h-10 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-32"></div>
             <div className="h-10 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-40"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1a2333] rounded-xl shadow-sm h-64 animate-pulse border border-gray-100 dark:border-gray-800 flex flex-col p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800/60 rounded-full w-24"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-full mb-3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-2/3 mb-auto"></div>
              
              <div className="mt-4 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800/60 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800/60 rounded w-24"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-800/60 rounded-lg w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
