import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>({
    id: "",
    email: "",
    role: "student",
    display_name: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    grade_level: "",
    subjects_needed: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error loading profile:", error.message)
      return
    }

    if (data) {
      setProfile((prev: any) => ({
        ...prev,
        ...data,
        display_name: data.display_name ?? "",
        full_name: data.full_name ?? prev.full_name,
        avatar_url: data.avatar_url ?? "",
        bio: data.bio ?? "",
        grade_level: data.grade_level ?? "",
        subjects_needed: data.subjects_needed || [],
      }))
    }
  }

  const handleChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...profile.subjects_needed]
    updated[index] = value
    setProfile((prev: any) => ({ ...prev, subjects_needed: updated }))
  }

  const addSubject = () => {
    setProfile((prev: any) => ({ ...prev, subjects_needed: [...prev.subjects_needed, ""] }))
  }

  const removeSubject = (index: number) => {
    const updated = [...profile.subjects_needed]
    updated.splice(index, 1)
    setProfile((prev: any) => ({ ...prev, subjects_needed: updated }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      display_name: profile.display_name,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      grade_level: profile.grade_level,
      subjects_needed: profile.subjects_needed,
      updated_at: new Date(),
    })

    setLoading(false)

    if (error) {
      console.error("Error updating profile:", error.message)
      alert("Failed to save profile.")
    } else {
      alert("Profile updated successfully!")
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-6">Profile Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profile.display_name || ""}
                    onChange={(e) => handleChange("display_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ""}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url || ""}
                    onChange={(e) => handleChange("avatar_url", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    rows={4}
                  />
                </div>
              </section>

              {/* Student Details */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Learning Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Input
                    id="grade_level"
                    value={profile.grade_level || ""}
                    onChange={(e) => handleChange("grade_level", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subjects Needed</Label>
                  {profile.subjects_needed.map((subject: string, index: number) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={subject || ""}
                        onChange={(e) => handleSubjectChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeSubject(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSubject}>
                    Add Subject
                  </Button>
                </div>
              </section>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
