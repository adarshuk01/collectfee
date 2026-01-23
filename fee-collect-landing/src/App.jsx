import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Landing from './pages/Landing'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
        <Landing/>
        <Footer/>
    </>
  )
}

export default App
