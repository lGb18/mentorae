import { BrowserRouter, Routes, Route} from "react-router-dom"
import { useState } from 'react'
import UpdateElectron from '@/components/update'
import logoM from './assets/m-logo.jpg'
import './App.css'
import LoginPage from '@/pages/login-page'

function App() {
  const [count, setCount] = useState(0)
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage/>} />
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