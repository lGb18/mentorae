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
import VideoChatWrapper from './pages/videochatWrapper'

import MathSubject from '@/pages/courses/math'
function WelcomePage() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="rounded bg-secondary px-4 py-2 hover:bg-secondary/80"
        >
          Sign Up
        </Link>
{/* 
        <Link 
        to="/learner-dashboard"
        className="rounded bg-secondary px-4 py-2 hover:bg-secondary/80"
        >
        Learner Dashboard
        </Link>
        <Link 
        to="/tutor-dashboard"
        className="rounded bg-secondary px-4 py-2 hover:bg-secondary/80"
        >
        Tutor Dashboard
        </Link>
        <Link 
        to="/my-profile"
        className="rounded bg-secondary px-4 py-2 hover:bg-secondary/80"
        >
        My Profile
        </Link> */}
      </div>
    </div>
  )
}
function App({ currentUserId }: { currentUserId: string }) {

  return (
    <HashRouter>
    <Routes>

      <Route path="/" element={<WelcomePage/>} />
      <Route path="login" element={<LoginPage/>} />
      <Route path="register" element={<RegisterPage/>} />
      <Route path="forgot-pw" element={<ForgotPasswordPage/>} />

      <Route path="learner-dashboard" element={<LearnerDashboard/>} />
      <Route path="tutor-dashboard" element={<TutorDashboard/>} />

      <Route path="my-profile" element={<ProfilePage/>} />
      <Route path="matchmaking" element={<Matchmaking/>} />
      <Route path="/chats" element={<ChatPage currentUserId={currentUserId} />} />
      {/* <Route path="course-page" element={<CoursePage subject={""}/>} /> */}
      <Route path="/video/:matchId" element={<VideoChatWrapper />} /> 
      <Route path="/tutor-dashboard/courses/math/:id" element={<CoursePage subject="math" />} />
      <Route path="/tutor-dashboard/courses/science/:id" element={<CoursePage subject="science" />} />
      <Route path="/tutor-dashboard/courses/english/:id" element={<CoursePage subject="english" />} />
      <Route path="/tutor-dashboard/courses/filipino/:id" element={<CoursePage subject="filipino" />} />



    </Routes>
    </HashRouter>
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