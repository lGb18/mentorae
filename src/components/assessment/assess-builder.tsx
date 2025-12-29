import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Question = {
  id: string
  type: "multiple_choice"
  prompt: string
  image?: string
  options: string[]
  correct: string
  points: number
}

export function AssessmentBuilder({
  tutorId,
  assessmentId,
  initialSchema,
  onSave,
}: {
  tutorId: string
  assessmentId: string
  initialSchema?: { questions: Question[] }
  onSave: (schema: any) => void
}) {
  const [questions, setQuestions] = useState<Question[]>(
    initialSchema?.questions ?? []
  )
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  async function uploadImage(file: File) {
    const path = `${tutorId}/${assessmentId}/${crypto.randomUUID()}-${file.name}`

    const { error } = await supabase.storage
      .from("assessment-assets")
      .upload(path, file)

    if (error) throw error

    const { data } = supabase.storage
      .from("assessment-assets")
      .getPublicUrl(path)

    return data.publicUrl
  }

  function addQuestion() {
    setQuestions((q) => [
      ...q,
      {
        id: crypto.randomUUID(),
        type: "multiple_choice",
        prompt: "",
        options: ["", "", "", ""],
        correct: "",
        points: 1,
      },
    ])
  }

  function removeQuestion(id: string) {
    setQuestions((q) => q.filter((question) => question.id !== id))
  }

  async function handleSave() {
    setSaving(true)
    await onSave({ questions })
    setSaving(false)
    setLastSaved(new Date().toLocaleTimeString())
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{questions.length} {questions.length === 1 ? "question" : "questions"}</span>
        {lastSaved && (
          <span className="text-green-600">Last saved: {lastSaved}</span>
        )}
      </div>

      {/* Questions */}
      {questions.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500 text-sm">No questions yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Click "Add Question" to get started.
          </p>
        </div>
      )}

      {questions.map((q, i) => (
        <div key={q.id} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Question {i + 1}</span>
            <button
              onClick={() => removeQuestion(q.id)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <textarea
            className="w-full border border-gray-300 rounded p-2 text-sm"
            placeholder="Question prompt (supports LaTeX)"
            rows={2}
            value={q.prompt}
            onChange={(e) => {
              const next = [...questions]
              next[i].prompt = e.target.value
              setQuestions(next)
            }}
          />

          <div>
            <label className="text-xs text-gray-500 block mb-1">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={async (e) => {
                if (!e.target.files?.[0]) return
                const url = await uploadImage(e.target.files[0])
                const next = [...questions]
                next[i].image = url
                setQuestions(next)
              }}
            />
          </div>

          {q.image && (
            <img src={q.image} className="max-w-xs mt-2 rounded border" />
          )}

          <div className="space-y-2">
            <label className="text-xs text-gray-500 block">Options</label>
            {q.options.map((opt, j) => (
              <input
                key={j}
                className="block w-full border border-gray-300 rounded p-2 text-sm"
                placeholder={`Option ${j + 1}`}
                value={opt}
                onChange={(e) => {
                  const next = [...questions]
                  next[i].options[j] = e.target.value
                  setQuestions(next)
                }}
              />
            ))}
          </div>

          <div className="space-y-1">
          <label className="text-xs text-gray-500">Correct Answer</label>
              {q.options.map((opt, j) => (
                <label key={j} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correct === opt}
                    onChange={() => {
                      const next = [...questions]
                      next[i].correct = opt
                      setQuestions(next)
                    }}
                  />
                  {opt || `Option ${j + 1}`}
                </label>
              ))}
        </div>

        </div>
      ))}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm rounded"
        >
          + Add Question
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Assessment"}
        </button>
      </div>
    </div>
  )
}