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
import QuizBuilderWrapper from '@/components/assessment/qb-wrapper'
import QuizScoreboardWrapper from '@/components/assessment/qs-wrapper'
import SubjectQuizzesTabWrapper from '@/components/assessment/subject-quizzes-wrap'
function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white border border-black rounded-md p-10"> {/* increased width & padding */}
        {/* App Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-32 h-16 bg-black rounded-md flex items-center justify-center"> {/* larger icon */}
            <span className="text-white font-semibold text-base">Mentorae</span> {/* larger text */}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-black mb-2">Welcome</h1> {/* larger heading */}
          <p className="text-sm text-black font-light">
            Continue to your account
          </p>
        </div>

        {/* Action Buttons */}
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
      

      
      <Route element={<MainLayout/>}>
        <Route path="my-profile" element={<ProfilePage/>} />
        <Route path="matchmaking" element={<Matchmaking/>} />
        <Route path="/chats" element={<ChatPage currentUserId={currentUserId} />} />
        {/* <Route path="course-page" element={<CoursePage subject={""}/>} /> */}
        <Route path="/video/:matchId" element={<VideoChatWrapper />} /> 
        <Route path="create-subject" element={<CreateSubject />} />

        <Route path="courses/:subjectName/:subjectId"element={<CoursePageWrapper />}>
          <Route path="quizzes" element={<SubjectQuizzesTabWrapper />} />
          <Route path="quizzes/new" element={<QuizBuilderWrapper />} />
          <Route path="quizzes/:quizId/edit" element={<QuizBuilderWrapper />} />
          <Route path="quizzes/:quizId/results" element={<QuizScoreboardWrapper />} />
        </Route>
        <Route path="/join/:matchId" element={< VideoChatWrapper/>} />
        
        {/* <Route path="/create-quiz"element={<QuizBuilder tutorId={""} subjectId={""} gradeLevel={""}/>} />
        <Route path="/my-quizzes" element={<QuizScoreboard assessmentId={""}/>}/> */}
      </Route>

      
    </Routes>
   
    // <div className='App'>
    //   <div className='logo-box'>
    //     <a href='https://github.com/electron-vite/electron-vite-react' target='_blank'>
    //       <img src={logoM} className='logo vite' alt='M' />
          
    //     </a>
    //   </div>
    //   <h1>Mentorae</h1>
    //   <div className='card'>
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <LoginForm/>
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className='read-the-docs'>
    //     Learn More
    //   </p>
    //   <div className='flex-center'>
    //     Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
    //   </div>

    //   <UpdateElectron />
    // </div>
  )
}

export default App