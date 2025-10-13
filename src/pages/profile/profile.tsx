"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20 border-2 border-black">
          <AvatarImage src="#" alt="Profile" />
          <AvatarFallback className="bg-gray-100 text-black font-medium">AVATAR</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Your Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and account settings.
          </p>
        </div>
      </div>

      <Separator className="bg-gray-300" />

      {/* Tabs Section */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg border border-gray-300">
          <TabsTrigger 
            value="info" 
            className="data-[state=active]:bg-black data-[state=active]:text-white text-black rounded-md transition-all"
          >
            Profile Info
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-black data-[state=active]:text-white text-black rounded-md transition-all"
          >
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="data-[state=active]:bg-black data-[state=active]:text-white text-black rounded-md transition-all"
          >
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Info */}
        <TabsContent value="info" className="mt-6">
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-black">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-sm font-medium text-black">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="border-gray-300 focus:border-black focus:ring-black text-black"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-sm font-medium text-black">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="border-gray-300 focus:border-black focus:ring-black text-black"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="phone" className="text-sm font-medium text-black">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+63 999 999 999" 
                    className="border-gray-300 focus:border-black focus:ring-black text-black"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    className="bg-black text-white hover:bg-gray-800 px-6 font-medium"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-6">
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-black">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-sm font-medium text-black">Change Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="New password" 
                    className="border-gray-300 focus:border-black focus:ring-black text-black"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    variant="outline"
                    className="border-gray-300 text-black hover:bg-gray-100 hover:border-black font-medium"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-6">
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-black">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                Manage your application preferences and notification settings.
              </p>
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline"
                  className="border-gray-300 text-black hover:bg-gray-100 hover:border-black font-medium"
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
