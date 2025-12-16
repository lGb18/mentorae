import * as React from "react"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Plus, Trash2, Save, FileText, CheckCircle2 } from "lucide-react"

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface QuizBuilderProps {
  tutorId: string
  subjectId: string
  gradeLevel: string
  quizId?: string           // optional for future edit
  onSaved: () => void
  onCancel: () => void
}

export default function QuizBuilder({
  tutorId,
  subjectId,
  gradeLevel,
  onSaved,
  onCancel,
}: QuizBuilderProps) {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", ""], correct: "" }
  ])

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", ""], correct: "" }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQ = [...questions]
      newQ.splice(index, 1)
      setQuestions(newQ)
    }
  }

  const updateQuestion = (index: number, field: string, value: any, optIndex?: number) => {
    const newQ = [...questions]
    if (field === "options" && typeof optIndex === "number") {
      newQ[index].options[optIndex] = value
    } else {
      // @ts-ignore
      newQ[index][field] = value
    }
    setQuestions(newQ)
  }

  const handleSave = async () => {
    if (!title.trim()) return alert("Please enter a quiz title.")
    setLoading(true)

    try {
      // 1️⃣ Insert quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          tutor_id: tutorId,
          subject_id: subjectId,
          grade_level: gradeLevel,
          title,
          is_published: false
        })
        .select()
        .single()

      if (quizError || !quiz) throw quizError || new Error("Failed to create quiz")

      // 2️⃣ Insert questions
      const questionRows = questions.map((q, i) => ({
        quiz_id: quiz.id,
        question_order: i + 1,
        question_text: q.text,
        question_type: "multiple_choice",
        options: q.options,
        correct_answer: q.correct,
        points: 1
      }))

      const { error: questionError } = await supabase
        .from("quiz_questions")
        .insert(questionRows)

      if (questionError) throw questionError

      alert("Quiz saved successfully!")
      onSaved()
    } catch (err) {
      console.error(err)
      alert("Failed to save quiz.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-1">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Create Assessment</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Quiz</>}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-2">
        <Label htmlFor="title">Quiz Title</Label>
        <Input
          id="title"
          placeholder="e.g. Mathematics - Module 1 Assessment"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <Card key={i} className="border-black/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Question {i + 1}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(i)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter your question here..."
                value={q.text}
                onChange={e => updateQuestion(i, "text", e.target.value)}
                className="font-medium"
              />
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                <Label className="text-xs text-muted-foreground">Answer Options</Label>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">{String.fromCharCode(65 + optIdx)}.</span>
                    <Input
                      placeholder={`Option ${optIdx + 1}`}
                      value={opt}
                      onChange={e => updateQuestion(i, "options", e.target.value, optIdx)}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Correct Answer
                </Label>
                <Input
                  placeholder="Paste the correct answer text here"
                  value={q.correct}
                  onChange={e => updateQuestion(i, "correct", e.target.value)}
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addQuestion} className="w-full border-dashed py-6">
        <Plus className="mr-2 h-4 w-4" /> Add Another Question
      </Button>
    </div>
  )
}
