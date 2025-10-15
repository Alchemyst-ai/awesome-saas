export default function PointDescription() {
    const points = [
      { score: 5, label: "Excellent", color: "bg-green-500" },
      { score: 4, label: "Good", color: "bg-emerald-400" },
      { score: 3, label: "Average", color: "bg-yellow-400" },
      { score: 2, label: "Poor", color: "bg-orange-400" },
      { score: 1, label: "Terrible", color: "bg-red-500" },
    ];
  
    return (
      <div className="max-w-sm mx-[8rem] mt-6 rounded-2xl  p-6 transition-transform">
        <h3 className=" text-lg font-semibold text-gray-800 mb-4">
           Score Meaning
        </h3>
        <ul className="space-y-3">
          {points.map((p) => (
            <li
              key={p.score}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${p.color}`}
              >
                {p.score}
              </span>
              <span className="text-gray-700 font-medium">{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  