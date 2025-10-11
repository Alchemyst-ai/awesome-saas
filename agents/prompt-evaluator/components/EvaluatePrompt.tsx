import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function EvaluatePrompt() {
    return (
        <div>
            {/* prompt input here */}
            <div className="flex items-center gap-2 w-full px-10 ">
                <div className="grid w-full max-w-sm items-center gap-1">
                    <Label>Prompt</Label>
                    <input type="text" placeholder="Enter your prompt here" 
                    className="w-full rounded-md h-[40px] text-md border border-primary-foreground" />
                </div>
                <div className="flex items-center ">
                    <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full max-w-sm h-[40px] bg-black text-white">Evaluate</Button>
                </div>
            </div>
        </div>
    )
}