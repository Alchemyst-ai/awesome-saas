import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function EvaluatePrompt() {
  return (
    <div className="w-full flex justify-center py-10 ">
      <div className="w-full max-w-3xl rounded-2xl  backdrop-blur-md p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between transition-all duration-300 ">
        {/* Input Section */}
        <div className="w-full flex flex-col gap-2 md:w-3/4">
          <Label htmlFor="prompt" className="text-slate-700 text-sm font-medium">
            Prompt
          </Label>
          <Input
            id="prompt"
            placeholder="Type your prompt here..."
            className="w-full h-[45px] rounded-xl border border-slate-300 text-[15px] placeholder:text-slate-400 focus:ring-2 transition-all"
          />
    
        </div>

        {/* Button Section */}
        <div className="w-full md:w-auto">
          <Button
            variant="secondary"
            size="lg"
            className="w-full md:w-auto h-[45px] rounded-xl bg-black text-white text-[15px] font-medium hover:opacity-90 transition-all"
          >
            Evaluate
          </Button>
        </div>
      </div>
    </div>
  );
}
