import { Survey } from "survey-react"
import { supabase } from "@/lib/supabaseClient"
type Props = {
  assessmentId: string
  studentId: string
  schema: any
  passingScore?: number
  canAttempt?: boolean
  attemptLimit?: number | null
  attemptsUsed?: number
}

export function AssessmentRunner({
  assessmentId,
  studentId,
  schema,
  passingScore = 70,
  canAttempt,
  attemptLimit,
  attemptsUsed = 0,
}: Props) {
  if (!canAttempt) {
    return (
      <div className="border rounded p-4 text-sm text-gray-600">
        You’ve reached the maximum number of attempts
        {attemptLimit != null && <> ({attemptsUsed}/{attemptLimit})</>}
        .
      </div>
    )
  }

  async function submitAttempt(answers: Record<string, any>) {
    let correct = 0
    let total = 0

    const pages = schema?.pages ?? [{ elements: schema?.elements ?? [] }]

    pages.forEach((page: any) => {
      page.elements?.forEach((q: any) => {
        if (q.correctAnswer !== undefined) {
          total++
          if (answers[q.name] === q.correctAnswer) correct++
        }
      })
    })

    const percentage = total ? (correct / total) * 100 : 0
    const passed = percentage >= passingScore

    const { error } = await supabase.from("assessment_attempts").insert({
      assessment_id: assessmentId,
      student_id: studentId,
      score: correct,
      percentage,
      passed,
      answers,
    })

    if (error) {
      console.error("Failed to save attempt:", error)
    }
  }

  return (
    <Survey
      json={
        schema?.pages
          ? schema
          : schema?.elements
            ? { pages: [{ name: "page1", elements: schema.elements ?? [] }] }
            : schema?.questions
              ? {
                  pages: [
                    {
                      name: "page1",
                      elements: schema.questions.reduce((acc: any[], q: any) => {
                        if (q.image) {
                          acc.push({
                            type: "html",
                            name: `${q.id}_img`,
                            html: `<img src="${q.image}" style="max-width: 320px; border-radius: 8px;" />`,
                          })
                        }

                        acc.push({
                          type: "radiogroup",
                          name: q.id,
                          title: q.prompt,
                          choices: q.options,
                          correctAnswer: q.correct,
                        })

                        return acc
                      }, []),
                    },
                  ],
                }
              : schema
      }
      onComplete={(survey: { data: Record<string, any> }) =>
        submitAttempt(survey.data)
      }
    />
  )
}