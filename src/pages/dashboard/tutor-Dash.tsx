import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function TutorDashboard() {
  const [profile, setProfile] = useState<any>({
    id: "",
    email: "",
    role: "teacher",
    display_name: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    subjects_taught: [],
    availability: {
      monday: { available: false, hours: "" },
      tuesday: { available: false, hours: "" },
      wednesday: { available: false, hours: "" },
      thursday: { available: false, hours: "" },
      friday: { available: false, hours: "" },
    },
    experience: "",
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
        experience: data.experience ?? "",
        availability: data.availability || prev.availability,
        subjects_taught: data.subjects_taught || [],
      }))
    }
  }

  const handleChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...profile.subjects_taught]
    updated[index] = value
    setProfile((prev: any) => ({ ...prev, subjects_taught: updated }))
  }

  const addSubject = () => {
    setProfile((prev: any) => ({ ...prev, subjects_taught: [...prev.subjects_taught, ""] }))
  }

  const removeSubject = (index: number) => {
    const updated = [...profile.subjects_taught]
    updated.splice(index, 1)
    setProfile((prev: any) => ({ ...prev, subjects_taught: updated }))
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
      subjects_taught: profile.subjects_taught,
      availability: profile.availability,
      experience: profile.experience,
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
          <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
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

              {/* Teaching Details */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Teaching Details</h3>

                <div className="space-y-2">
                  <Label>Subjects Taught</Label>
                  {profile.subjects_taught.map((subject: string, index: number) => (
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

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    value={profile.experience || ""}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    rows={3}
                  />
                </div>
              </section>

              {/* Availability */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Availability</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(profile.availability).map(([day, data]: any) => (
                    <div key={day} className="space-y-2 p-3 border rounded-lg">
                      <Label className="capitalize">{day}</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={data.available}
                          onChange={(e) => {
                            const newAvailability = {
                              ...profile.availability,
                              [day]: { ...data, available: e.target.checked },
                            }
                            handleChange("availability", newAvailability)
                          }}
                        />
                        <span>Available</span>
                      </div>
                      {data.available && (
                        <Input
                          value={data.hours || ""}
                          onChange={(e) => {
                            const newAvailability = {
                              ...profile.availability,
                              [day]: { ...data, hours: e.target.value },
                            }
                            handleChange("availability", newAvailability)
                          }}
                        />
                      )}
                    </div>
                  ))}
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
