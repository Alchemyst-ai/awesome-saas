"use client";

import { Copy } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export default function CopyButton({textToCopy}: {textToCopy: string}) {
    const [copied,setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => {setCopied(false), 1000});
    }
    return (
        <div>
            <Button variant="ghost" onClick={handleCopy} disabled={copied}>
                <Copy className="w-6 h-6"/>
                {copied ? <span>Copied!</span> : null}
            </Button>
        </div>
    )
}