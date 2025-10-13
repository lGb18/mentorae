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
        <header className="flex h-16 items-center gap-2 border-b border-gray-300 px-4 bg-white">
          <SidebarTrigger className="-ml-1 text-black hover:bg-gray-100" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <h1 className="text-xl font-bold text-black tracking-tight">Student Dashboard</h1>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Profile Settings</h2>
              <div className="h-1 w-12 bg-black"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <section className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Basic Information</h3>
                  <p className="text-sm text-gray-600 mt-1">Your personal profile details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="display_name" className="text-sm font-medium text-black">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ""}
                      onChange={(e) => handleChange("display_name", e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black text-black"
                      placeholder=" "
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-sm font-medium text-black">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ""}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black text-black"
                      placeholder=" "
                    />
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <Label htmlFor="avatar_url" className="text-sm font-medium text-black">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url || ""}
                    onChange={(e) => handleChange("avatar_url", e.target.value)}
                    className="border-gray-300 focus:border-black focus:ring-black text-grey"
                    placeholder=" "
                  />
                </div>

                <div className="space-y-3 mt-6">
                  <Label htmlFor="bio" className="text-sm font-medium text-black">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    rows={4}
                    className="border-gray-300 focus:border-black focus:ring-black text-grey"
                    placeholder=" "
                  />
                </div>
              </section>

              {/* Learning Details */}
              <section className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Learning Details</h3>
                  <p className="text-sm text-gray-600 mt-1">Help tutors understand your academic needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="grade_level" className="text-sm font-medium text-black">Grade Level</Label>
                    <Input
                      id="grade_level"
                      value={profile.grade_level || ""}
                      onChange={(e) => handleChange("grade_level", e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black text-black"
                      placeholder=" "
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-black block">Subject Preference</Label>
                    <div className="space-y-3">
                      {profile.subjects_needed.map((subject: string, index: number) => (
                        <div key={index} className="flex gap-3 items-center">
                          <Input
                            value={subject || ""}
                            onChange={(e) => handleSubjectChange(index, e.target.value)}
                            className="border-gray-300 focus:border-black focus:ring-black text-black flex-1"
                            placeholder=" "
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeSubject(index)}
                            className="border-gray-300 text-black hover:bg-gray-100 hover:border-black"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addSubject}
                      className="mt-4 border-gray-300 text-black hover:bg-gray-100 hover:border-black"
                    >
                      + Add Subject
                    </Button>
                  </div>
                </div>
              </section>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-black text-white hover:bg-gray-800 px-8 py-2 font-medium"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
