"use client"

import { useState, useEffect } from "react"
import { Settings, Eye, EyeOff, Trash2, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const GITHUB_TOKEN_KEY = "gitalchemy_github_token"

export function SettingsDialog() {
    const [open, setOpen] = useState(false)
    const [token, setToken] = useState("")
    const [showToken, setShowToken] = useState(false)
    const [saved, setSaved] = useState(false)
    const [hasStoredToken, setHasStoredToken] = useState(false)

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(GITHUB_TOKEN_KEY)
        if (storedToken) {
            setToken(storedToken)
            setHasStoredToken(true)
        }
    }, [])

    const handleSave = () => {
        if (token.trim()) {
            localStorage.setItem(GITHUB_TOKEN_KEY, token.trim())
            setHasStoredToken(true)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    const handleClear = () => {
        localStorage.removeItem(GITHUB_TOKEN_KEY)
        setToken("")
        setHasStoredToken(false)
    }

    const maskToken = (t: string) => {
        if (t.length <= 8) return "••••••••"
        return t.slice(0, 4) + "••••••••" + t.slice(-4)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Settings
                    </DialogTitle>
                    <DialogDescription>
                        Add your GitHub token to access private repositories.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            GitHub Personal Access Token
                        </label>
                        <div className="relative">
                            <Input
                                type={showToken ? "text" : "password"}
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowToken(!showToken)}
                            >
                                {showToken ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {hasStoredToken && !showToken && (
                            <p className="text-xs text-muted-foreground">
                                Saved: {maskToken(token)}
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
                        <p className="font-medium text-foreground">Token Requirements:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Create at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">github.com/settings/tokens <ExternalLink className="h-3 w-3" /></a></li>
                            <li>Select <code className="bg-background px-1 rounded">repo</code> scope for private repos</li>
                            <li>Token is stored only in your browser</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {hasStoredToken && (
                        <Button variant="outline" onClick={handleClear} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Clear
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={!token.trim()} className="gap-2">
                        {saved ? (
                            <>
                                <Check className="h-4 w-4" />
                                Saved!
                            </>
                        ) : (
                            "Save Token"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Helper function to get the stored token
export function getStoredGitHubToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(GITHUB_TOKEN_KEY)
}
