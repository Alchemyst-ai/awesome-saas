import CopyButton from "./Copybutton"

export const ImprovedPrompt = ({ improvedPrompt }: { improvedPrompt: string }) => {
    return (
        <div className="max-w-4xl mx-auto mt-8">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-t-2xl"></div>
  
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between gap-2">
             Improved Prompt
            <CopyButton textToCopy={improvedPrompt} />
          </h2>
          <p className="text-gray-700 leading-relaxed tracking-wide text-base">
            {improvedPrompt}
          </p>   
        </div>
      </div>
    )
}