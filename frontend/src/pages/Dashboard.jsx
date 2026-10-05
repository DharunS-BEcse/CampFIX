export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Campus Issues</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          + Report New Issue
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-4 flex justify-between items-center border-l-4 border-yellow-500">
        <div>
          <h3 className="text-xl font-bold mb-1">Leaky pipe in the Library</h3>
          <p className="text-gray-600 mb-2">Water is dripping near the computing section on the 3rd floor.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>📍 Library, 3rd Floor</span>
            <span className="font-semibold text-yellow-600">Pending</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-full font-bold flex items-center gap-2 transition">
            ▲ Prioritize
          </button>
          <span className="text-gray-500 mt-2 font-medium">12 votes</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-4 flex justify-between items-center border-l-4 border-blue-500">
        <div>
          <h3 className="text-xl font-bold mb-1">Broken projector</h3>
          <p className="text-gray-600 mb-2">The projector in hall A is completely unresponsive.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>📍 Block A, Hall 1</span>
            <span className="font-semibold text-blue-600">In Progress</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 transition">
            ▲ Prioritized
          </button>
          <span className="text-gray-500 mt-2 font-medium">45 votes</span>
        </div>
      </div>
    </div>
  );
}
