export default function EvaluationDescription() {
    return (
      <div className="max-w-5xl mx-auto mt-12 px-6 py-10 rounded-2xl bg-white">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
          Evaluation Criteria
        </h2>
        
        <ul className="space-y-5 text-gray-700 text-lg list-decimal list-inside leading-relaxed">
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Relevance:</strong> How well does the response address the user's query?
          </li>
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Intent Match:</strong> Does the response align with the user’s intent and expected outcome?
          </li>
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Groundedness:</strong> Is the response backed by verifiable facts or logical reasoning?
          </li>
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Fluency:</strong> Is the language smooth, natural, and free of grammatical errors?
          </li>
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Conciseness:</strong> Is the response brief yet informative, avoiding unnecessary repetition or fluff?
          </li>
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Reference Alignment:</strong> Does the response accurately reflect and align with any provided references or context?
          </li>
          <li className="transition-transform hover:translate-x-2 hover:text-gray-900">
            <strong className="font-semibold text-gray-900">Tonality:</strong> Is the tone appropriate, clear, and consistent with the prompt’s style?
          </li>
        </ul>
      </div>
    );
  }
  