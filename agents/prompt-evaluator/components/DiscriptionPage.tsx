export default function DiscriptionPage(){
    return (
        <div className="mt-10 max-w-2xl mx-auto text-center bg-white rounded-3xl shadow-md p-6">
      {/* Description */}
      <p className="text-gray-600 text-base mb-6 leading-relaxed">
        Welcome to the Prompt Evaluator!  
        This tool analyzes your prompt and gives you structured feedback —
        helping you improve clarity, groundedness, tonality, and overall effectiveness.
      </p>

      {/* Instructions Section */}
      <div className="text-left bg-gray-50 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          How to use:
        </h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Type or paste your prompt in the box above.</li>
          <li>Click the <strong>“Evaluate”</strong> button.</li>
          <li>View instant evaluation results in a structured format.</li>
        </ul>
      </div>
    </div>
    )
}