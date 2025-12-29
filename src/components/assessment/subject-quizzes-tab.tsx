import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { Plus, MoreVertical, CheckCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type SubjectQuizzesTabProps = {
  subjectId: string
  isTutor?: boolean
}

export default function SubjectQuizzesTab({
  subjectId,
  isTutor = false,
}: SubjectQuizzesTabProps) {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)

  const fetchQuizzes = async () => {
    setLoading(true)

    let query = supabase
      .from("quizzes")
      .select("id, title, is_published, created_at")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false })

    // 🔒 Students only see published quizzes
    if (!isTutor) {
      query = query.eq("is_published", true)
    }

    const { data } = await query
    setQuizzes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchQuizzes()
  }, [subjectId, isTutor])

  const togglePublish = async (quizId: string, currentStatus: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "unpublish" : "publish"} this quiz?`
      )
    )
      return

    const { error } = await supabase
      .from("quizzes")
      .update({ is_published: !currentStatus })
      .eq("id", quizId)

    if (error) {
      console.error(error)
      alert("Failed to update publish status")
    } else {
      fetchQuizzes()
    }
  }

  const bulkPublishAll = async () => {
    if (!confirm("Are you sure you want to publish all drafts?")) return

    setBulkLoading(true)

    const draftIds = quizzes.filter(q => !q.is_published).map(q => q.id)

    if (draftIds.length === 0) {
      alert("No drafts to publish.")
      setBulkLoading(false)
      return
    }

    const { error } = await supabase
      .from("quizzes")
      .update({ is_published: true })
      .in("id", draftIds)

    if (error) {
      console.error(error)
      alert("Failed to publish all quizzes")
    } else {
      fetchQuizzes()
    }

    setBulkLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Quizzes</h3>
          <p className="text-sm text-muted-foreground">
            {isTutor
              ? "Create and manage assessments for this subject."
              : "Available assessments for this subject."}
          </p>
        </div>

        {/* Tutor-only actions */}
        {isTutor && (
          <div className="flex gap-2">
            <Button onClick={() => navigate(`quizzes/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
            <Button
              variant="outline"
              onClick={bulkPublishAll}
              disabled={bulkLoading}
            >
              Publish All Drafts
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              {isTutor && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={isTutor ? 4 : 3}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading quizzes…
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isTutor ? 4 : 3}
                  className="h-32 text-center text-muted-foreground"
                >
                  No quizzes available.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map(quiz => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>

                  <TableCell>
                    {quiz.is_published ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Draft
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Tutor-only actions */}
                  {isTutor && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `quizzes/${quiz.id}/edit`
                              )
                            }
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `quizzes/${quiz.id}/results`
                              )
                            }
                          >
                            View Results
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              togglePublish(quiz.id, quiz.is_published)
                            }
                          >
                            {quiz.is_published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
