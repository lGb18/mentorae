import { BrowserRouter, Routes, Route, Link} from "react-router-dom"
import { useState } from 'react'
import UpdateElectron from '@/components/update'
import logoM from './assets/m-logo.jpg'
import './App.css'
import LoginPage from '@/pages/login-page'
import RegisterPage from '@/pages/register-page'
import ForgotPasswordPage from '@/pages/forgot-pw-page'

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
      </div>
    </div>
  )
}
function App() {
  const [count, setCount] = useState(0)
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<WelcomePage/>} />
      <Route path="login" element={<LoginPage/>} />
      <Route path="register" element={<RegisterPage/>} />
      <Route path="forgot-pw" element={<ForgotPasswordPage/>} />
    </Routes>
    </BrowserRouter>
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