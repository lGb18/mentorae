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
  useEffect(() => {
    const fetchSubjects = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("tutor_id", user.id);

      if (error) {
        console.error("Fetch subjects error:", error);
        return;
      }

      setSubjectsFromDB(data || []);
    };

    fetchSubjects();
  }, []);

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
  const [subjectsFromDB, setSubjectsFromDB] = useState<{ id: string; name: string }[]>([]);
  
  const handleChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }))
  }

  // const handleSubjectChange = (index: number, value: string) => {
  //   const updated = [...profile.subjects_taught]
  //   updated[index] = value
  //   setProfile((prev: any) => ({ ...prev, subjects_taught: updated }))
  // }

  // const addSubject = () => {
  //   setProfile((prev: any) => ({ ...prev, subjects_taught: [...prev.subjects_taught, ""] }))
  // }

  // const removeSubject = (index: number) => {
  //   const updated = [...profile.subjects_taught]
  //   updated.splice(index, 1)
  //   setProfile((prev: any) => ({ ...prev, subjects_taught: updated }))
  // }

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
        <header className="flex h-16 items-center gap-2 border-b border-gray-300 px-4 bg-white">
          <SidebarTrigger className="-ml-1 text-black hover:bg-gray-100" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-gray-300" />
          <h1 className="text-xl font-bold text-black tracking-tight">Tutor Dashboard</h1>
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
                  <p className="text-sm text-gray-600 mt-1">Update your personal details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="display_name" className="text-sm font-medium text-black">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ""}
                      onChange={(e) => handleChange("display_name", e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black text-black"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="full_name" className="text-sm font-medium text-black">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ""}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      className="border-gray-300 focus:border-black focus:ring-black text-black"
                    />
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <Label htmlFor="avatar_url" className="text-sm font-medium text-black">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url || ""}
                    onChange={(e) => handleChange("avatar_url", e.target.value)}
                    className="border-gray-300 focus:border-black focus:ring-black text-black"
                  />
                </div>

                <div className="space-y-3 mt-6">
                  <Label htmlFor="bio" className="text-sm font-medium text-black">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    rows={4}
                    className="border-gray-300 focus:border-black focus:ring-black text-black"
                  />
                </div>
              </section>

              {/* Teaching Details */}
              <section className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Teaching Details</h3>
                  <p className="text-sm text-gray-600 mt-1">Define your teaching expertise</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-black mb-3 block">Subjects Taught</Label>

                      {subjectsFromDB.map((subject: any) => (
                        <div key={subject.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                          <span className="text-black">{subject.name}</span>
                        </div>
                      ))}

                      {subjectsFromDB.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No subjects created yet.</p>
                      )}
                    </div>

                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="experience" className="text-sm font-medium text-black">Experience</Label>
                    <Textarea
                      id="experience"
                      value={profile.experience || ""}
                      onChange={(e) => handleChange("experience", e.target.value)}
                      rows={3}
                      className="border-gray-300 focus:border-black focus:ring-black text-black"
                      placeholder=" "
                    />
                  </div>
                </div>
              </section>

              {/* Availability */}
              <section className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-black">Availability</h3>
                  <p className="text-sm text-gray-600 mt-1">Set your weekly teaching schedule</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(profile.availability).map(([day, data]: any) => (
                    <div key={day} className="space-y-3 p-4 border border-gray-300 rounded-lg bg-white">
                      <Label className="capitalize text-sm font-medium text-black block text-center">
                        {day}
                      </Label>
                      <div className="flex items-center justify-center space-x-2">
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
                          className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                        />
                        <span className="text-sm text-black">Available</span>
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
                          className="border-gray-300 focus:border-black focus:ring-black text-black text-sm"
                          placeholder="9:00 AM - 5:00 PM"
                        />
                      )}
                    </div>
                  ))}
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
