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

import { MainLayout } from './components/main-layout'

function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xs bg-white border border-black rounded-sm p-8">
        {/* App Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white font-medium text-xs">Mentorae</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-medium text-black mb-1">Welcome</h1>
          <p className="text-xs text-black font-light">
              Continue to your account
          </p>
        </div>

        {/* Action Buttons - Fixed alignment */}
        <div className="space-y-3">
          <Link
            to="/login"
            className="w-full box-border bg-black text-white py-2.5 px-4 text-sm font-medium hover:bg-white hover:text-black transition-all duration-150 flex items-center justify-center border border-black rounded-sm"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="w-full box-border bg-white text-black py-2.5 px-4 text-sm font-medium hover:bg-black hover:text-white transition-all duration-150 flex items-center justify-center border border-black rounded-sm"
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
    <HashRouter>
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
        <Route path="/tutor-dashboard/courses/math/:id" element={<CoursePage subject="math" />} />
        <Route path="/tutor-dashboard/courses/science/:id" element={<CoursePage subject="science" />} />
        <Route path="/tutor-dashboard/courses/english/:id" element={<CoursePage subject="english" />} />
        <Route path="/tutor-dashboard/courses/filipino/:id" element={<CoursePage subject="filipino" />} />

        <Route path="/join/:matchId" element={< VideoChatWrapper/>} />
      </Route>



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