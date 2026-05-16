import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface RepoCardProps {
  owner: string
  name: string
  description: string
  stars: number
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`
  }
  return stars.toString()
}

export function RepoCard({ owner, name, description, stars }: RepoCardProps) {
  return (
    <Link href={`/${owner}/${name}`}>
      <Card className="group h-full cursor-pointer border-border bg-card transition-all duration-200 hover:border-primary/50 hover:bg-accent/50">
        <CardContent className="flex h-full flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary">
              {owner}/{name}
            </h3>
            <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
              <span>{formatStars(stars)}</span>
            </div>
          </div>
          <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
