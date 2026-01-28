'use client'

import AuthForm from '@/components/forms/AuthForms'
import { SignUpSchema } from '@/lib/validation'
const SignUp = () => {
  return (
    <AuthForm 
    formType='SIGN_IN'
    schema={SignUpSchema}
    defaultValues={{email: '', password: "", name: '', username:''}}
    onSubmit={(data)=>Promise.resolve({success: true, data})}
    />
  )
}

export default SignUp