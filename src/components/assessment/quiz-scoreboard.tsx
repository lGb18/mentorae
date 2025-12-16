import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface QuizScoreboardProps {
  quizId: string
  onBack?: () => void | Promise<void> 
}

export default function QuizScoreboard({ quizId, onBack }: QuizScoreboardProps) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select(`
          score,
          total_points,
          percentage,
          passed,
          completed_at,
          profiles:student_id ( full_name, email )
        `)
        .eq("quiz_id", quizId)
        .order("completed_at", { ascending: false })

      setResults(data || [])
      setLoading(false)
    }
    fetchResults()
  }, [quizId])

  const exportToCSV = () => {
    if (!results.length) return
    const headers = ["Student Name", "Email", "Score", "Total Points", "Percentage", "Passed", "Date"]
    const rows = results.map(r => [
      r.profiles?.full_name || "Unknown",
      r.profiles?.email || "No Email",
      r.score,
      r.total_points,
      r.percentage,
      r.passed ? "Yes" : "No",
      new Date(r.completed_at).toLocaleDateString()
    ])
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `results-${quizId}.csv`
    a.click()
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Student Performance</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={results.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date Taken</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.profiles?.full_name || "Unknown"}</TableCell>
                  <TableCell>{r.profiles?.email || "-"}</TableCell>
                  <TableCell>{new Date(r.completed_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-mono">{r.score} / {r.total_points}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
