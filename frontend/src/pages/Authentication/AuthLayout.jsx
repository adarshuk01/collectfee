import React from 'react'
import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div 
      className="h-[90vh] bg-primary w-full flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: ``
      }}
    >
      {/* Blur / white panel if needed */}
      <div className="bg-white  backdrop-blur-md p- m-3 rounded-2xl shadow-xl w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
