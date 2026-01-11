import { useState } from "react"
import { Survey, Model } from "survey-react"
import "survey-react/survey.min.css"
import { supabase } from "@/lib/supabaseClient"

type Props = {
  assessmentId: string
  studentId: string
  schema: any
  passingScore?: number
  canAttempt: boolean
  attemptLimit?: number | null
  attemptsUsed?: number
  onSubmitted?: () => void
}

export function AssessmentRunner({
  assessmentId,
  studentId,
  schema,
  passingScore = 70,
  canAttempt,
  attemptLimit,
  attemptsUsed = 0,
  onSubmitted,
}: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{
    correct: number
    total: number
    percentage: number
    passed: boolean
  } | null>(null)

  if (!canAttempt) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 text-center bg-gray-50">
        <div className="text-gray-400 text-4xl mb-3">✕</div>
        <p className="text-gray-900 font-medium">
          You've reached the maximum number of attempts
        </p>
        {attemptLimit != null && (
          <p className="text-sm text-gray-500 mt-1">
            ({attemptsUsed}/{attemptLimit} attempts used)
          </p>
        )}
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
        <div className="text-4xl mb-4">{result.passed ? "✓" : "—"}</div>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {result.passed ? "Assessment Passed" : "Assessment Submitted"}
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          {result.passed
            ? "You've met the passing criteria."
            : "Review the material and try again."}
        </p>

        <div className="inline-flex items-center gap-8 border border-gray-200 rounded-lg px-8 py-5">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {result.correct}/{result.total}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
              Correct
            </p>
          </div>

          <div className="h-10 w-px bg-gray-200" />

          <div className="text-center">
            <p
              className={`text-2xl font-semibold ${
                result.passed ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {Math.round(result.percentage)}%
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
              Score
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          Passing score: {passingScore}%
        </p>
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

    setResult({ correct, total, percentage, passed })
    setSubmitted(true)
    onSubmitted?.()
  }

  const surveyJson =
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
                        html: `<img src="${q.image}" style="max-width: 100%; border-radius: 6px; margin-bottom: 12px; border: 1px solid #e5e7eb;" />`,
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

  const survey = new Model({
    ...surveyJson,
    showCompletedPage: false,
    completeText: "Submit",
    showProgressBar: "top",
    progressBarType: "questions",
  })

  survey.onComplete.add((sender) => {
    submitAttempt(sender.data)
  })

  return (
    <>
      <style>{`
        .sv_main {
          font-family: inherit;
        }

        .sv_main .sv_container {
          padding: 0 !important;
          color: #0a0a0a;
        }

        .sv_main .sv_body {
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
        }

        .sv_main .sv_p_root {
          padding: 0 !important;
        }

        /* Question styling */
        .sv_main .sv_q {
          padding: 20px;
          margin-bottom: 16px;
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .sv_main .sv_q_title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #0a0a0a;
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .sv_main .sv_q_num {
          font-weight: 500;
          color: #71717a;
        }

        /* Radio choices */
        .sv_main .sv_q_radiogroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sv_main .sv_q_radiogroup_label {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.1s ease;
          font-size: 0.875rem;
          color: #0a0a0a;
        }

        .sv_main .sv_q_radiogroup_label:hover {
          background: #f4f4f5;
          border-color: #d4d4d8;
        }

        .sv_main input[type="radio"]:checked + .sv_q_radiogroup_label,
        .sv_main .sv_q_radiogroup_label.checked,
        .sv_main .sv_q_radiogroup .checked {
          background: #0a0a0a;
          border-color: #0a0a0a;
          color: white;
        }

        .sv_main .sv_q_radiogroup input[type="radio"] {
          accent-color: #0a0a0a;
        }

        /* Progress bar */
        .sv_main .sv_progress {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .sv_main .sv_progress_bar {
          height: 100%;
          background: #0a0a0a;
          border-radius: 2px;
          transition: width 0.2s ease;
        }

        /* Progress text */
        .sv_main .sv_progress_text {
          font-size: 0.75rem;
          color: #71717a;
          margin-bottom: 8px;
        }

        /* Navigation buttons */
        .sv_main .sv_nav {
          padding: 20px 0 0 0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #e5e7eb;
          margin-top: 8px;
        }

        .sv_main .sv_complete_btn,
        .sv_main .sv_next_btn,
        .sv_main .sv_prev_btn {
          padding: 9px 18px;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .sv_main .sv_complete_btn {
          background: #0a0a0a;
          color: white;
        }

        .sv_main .sv_complete_btn:hover {
          background: #262626;
        }

        .sv_main .sv_next_btn {
          background: #0a0a0a;
          color: white;
        }

        .sv_main .sv_next_btn:hover {
          background: #262626;
        }

        .sv_main .sv_prev_btn {
          background: white;
          color: #0a0a0a;
          border: 1px solid #e5e7eb;
        }

        .sv_main .sv_prev_btn:hover {
          background: #f4f4f5;
        }

        /* Hide default header */
        .sv_main .sv_header {
          display: none;
        }

        /* Required asterisk */
        .sv_main .sv_q_required_text {
          color: #ef4444;
        }

        /* Error styling */
        .sv_main .sv_q_erbox {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 6px;
        }

        /* Focus states */
        .sv_main .sv_q_radiogroup_label:focus-within {
          outline: 2px solid #0a0a0a;
          outline-offset: 2px;
        }
      `}</style>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <Survey model={survey} />
      </div>
    </>
  )
}