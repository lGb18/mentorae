import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "react-quill/dist/quill.snow.css";
import './index.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App currentUserId={''} />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
