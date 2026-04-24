'use client'

import AuthForm from '@/components/forms/AuthForms'
import { signUpWithCredentials } from '@/lib/action/auth.action'
import { SignUpSchema } from '@/lib/validation'
const SignUp = () => {
  return (
    <AuthForm 
    formType='SIGN_IN'
    schema={SignUpSchema}
    defaultValues={{email: '', password: "", name: '', username:''}}
    onSubmit={signUpWithCredentials}
    />
  )
}

export default SignUp