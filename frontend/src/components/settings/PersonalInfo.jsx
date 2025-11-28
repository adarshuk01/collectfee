import React from 'react'
import InputField from '../common/InputField'
import Button from '../common/Button'
import CommonHeader from '../common/CommonHeader'

function PersonalInfo() {
    return (
        <div className='space-y-4'>
            <CommonHeader title="Personal Info" />
            <form className='space-y-4' action="">
                <InputField label={' Name'} />           
                <InputField label={'Email'} />
                <InputField label={'Phone'} />
                <Button disabled text={'Save Changes'} />




            </form>
        </div>
    )
}

export default PersonalInfo
