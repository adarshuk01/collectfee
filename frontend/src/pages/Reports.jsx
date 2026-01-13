import React from 'react'
import { Link } from 'react-router-dom'

function Report() {
  return (
    <div className='flex gap-5 flex-wrap' >
     <Link to={'/reports/fee'} className='bg-primary p-6 rounded shadow-md text-white uppercase'>
      Group wise Fee Report

     </Link>
     <Link to={'/reports/attendance'} className='bg-primary p-6 rounded shadow-md text-white uppercase'>
     Grounp Wise Attendance Report

     </Link>
    </div>
  )
}

export default Report
