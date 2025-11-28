import React from 'react'
import InputField from '../../components/common/InputField'
import Button from '../../components/common/Button'

function ForgotPass() {
  return (
    <div className="">
        <div className="p-6 space-y-6 w-full max-w-">
       {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-grey100">Forgot Password</h2>
          <p className="text-grey90">
          Recover your account password
          </p>
        </div>
        <form className='space-y-4' action="">
            <InputField
            label="Email Address"
            placeholder="Enter your email address"
            type="email"
            name="email"
            // value={form.email}
            // onChange={handleChange}
            // error={errors.email}
          />
          <Button
          className='w-full'
            text="Next"
            variant="primary"
            size="lg"
          />
        </form>
        </div>
    </div>
  )
}

export default ForgotPass
