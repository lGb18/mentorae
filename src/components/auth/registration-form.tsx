import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { signUp, Role } from "@/lib/auth"

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<Role>('student') // or 'teacher'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError("Please fill all required fields.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)
      const result = await signUp(email, password, role, name)
      if (result?.session) {
        // immediate login - fetch profile will be handled by login flow
        navigate(role === 'teacher' ? "/tutor-dashboard" : "/learner-dashboard")
      } else {
        // email confirmation flow, send user to login & inform
        alert("Account created — check your email for confirmation (if required).")
        navigate("/login")
      }
    } catch (err: any) {
      setError(err.message ?? "Signup failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-black">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-black">Create an account</CardTitle>
          <CardDescription className="text-black">Sign up with your Apple or Google account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* social buttons */}
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full border border-black bg-white text-black hover:bg-black hover:text-white">
                  Sign up with Apple
                </Button>
                <Button variant="outline" className="w-full border border-black bg-white text-black hover:bg-black hover:text-white">
                  Sign up with Google
                </Button>
              </div>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-black">
                <span className="relative z-10 bg-white px-2 text-black">Or continue with</span>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-black">Name</Label>
                  <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="h-10 box-border px-4 py-2.5 text-sm border bg-transparent" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-black">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 box-border px-4 py-2.5 text-sm border bg-transparent" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-black">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10 box-border px-4 py-2.5 text-sm border bg-transparent" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-10 box-border px-4 py-2.5 text-sm border bg-transparent" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-black">Sign up as</Label>
                  <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="border border-black rounded-sm p-2 bg-white text-black">
                    <option value="student">Student / Learner</option>
                    <option value="teacher">Teacher / Tutor</option>
                  </select>
                </div>

                <Button type="submit" className="w-full border border-black bg-black text-white hover:bg-white hover:text-black" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </div>

              <div className="text-center text-sm text-black">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4 text-black">Login</Link>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-black">
        By signing up, you agree to our <a href="#" className="text-black">Terms of Service</a> and <a href="#" className="text-black">Privacy Policy</a>.
      </div>
    </div>
  )
}
