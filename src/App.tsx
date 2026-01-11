import { HashRouter, Routes, Route, Link} from "react-router-dom"
import { useState } from 'react'
import './App.css'

import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import ForgotPasswordPage from '@/pages/auth/forgot-pw-page'

import TutorDashboard from '@/pages/dashboard/tutor-Dash'
import LearnerDashboard from '@/pages/dashboard/learner-Dash'

import ProfilePage from '@/pages/profile/profile'
import Matchmaking from '@/pages/matchmaking'
import ChatPage from '@/components/chats/chatpage'
import CoursePage from './components/course-page'
import CreateSubject from './components/create-subject'
import VideoChatWrapper from './pages/videochatWrapper'
import CoursePageWrapper from './pages/courses/course-page-wrapper'
import { MainLayout } from './components/main-layout'
import { AssessmentAttemptsPage } from "./components/assessment/attempts-page"
import { TutorProgressDashboard } from "./components/progress-dashboard"
import { TutorStudentProgressPage } from "./components/student-progress"
import { StudentAssessmentAttemptBlock } from "@/components/assessment/student-attempt"
function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white border border-black rounded-md p-10"> 
        <div className="flex justify-center mb-8">
          <div className="w-32 h-16 bg-black rounded-md flex items-center justify-center"> 
            <span className="text-white font-semibold text-base">Mentorae</span> 
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-black mb-2">Welcome</h1>
          <p className="text-sm text-black font-light">
            Continue to your account
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full box-border bg-black text-white py-3 px-6 text-base font-medium hover:bg-white hover:text-black transition-all duration-150 flex items-center justify-center border border-black rounded-md"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="w-full box-border bg-white text-black py-3 px-6 text-base font-medium hover:bg-black hover:text-white transition-all duration-150 flex items-center justify-center border border-black rounded-md"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  )
}


function App({ currentUserId }: { currentUserId: string }) {

  return (
   
    <Routes>
      
      <Route path="/" element={<WelcomePage/>} />
      <Route path="login" element={<LoginPage/>} />
      <Route path="register" element={<RegisterPage/>} />
      <Route path="forgot-pw" element={<ForgotPasswordPage/>} />

      <Route path="learner-dashboard" element={<LearnerDashboard/>} />
      <Route path="tutor-dashboard" element={<TutorDashboard/>} />

      <Route path="/tutor/progress/:studentId/:gradeLevel" element={<TutorStudentProgressPage />}/>

      
      <Route element={<MainLayout/>}>
        <Route path="my-profile" element={<ProfilePage/>} />
        <Route path="matchmaking" element={<Matchmaking/>} />
        <Route path="/chats" element={<ChatPage currentUserId={currentUserId} />} />
        {/* <Route path="course-page" element={<CoursePage subject={""}/>} /> */}
        <Route path="/video/:matchId" element={<VideoChatWrapper />} /> 
        <Route path="create-subject" element={<CreateSubject />} />

        <Route path="courses/:subjectName/:subjectId"element={<CoursePageWrapper />} />
        <Route path="/join/:matchId" element={< VideoChatWrapper/>} />
        <Route path="/assessments/:assessmentId/attempts"element={<AssessmentAttemptsPage />}
/>
              <Route path="/tutor/progress" element={<TutorProgressDashboard />} />
      </Route>



    </Routes>
   
  )
}

export default App