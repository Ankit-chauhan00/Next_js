'use client'
import AuthForm from '@/components/forms/AuthForms'
import { signIpWithCredentials } from '@/lib/action/auth.action'
import { SignInSchema } from '@/lib/validation'


const SignIn = () => {
  return (
    <AuthForm 
    formType='SIGN_IN'
    schema={SignInSchema}
    defaultValues={{email: '', password: ""}}
    onSubmit={signIpWithCredentials}
    />
  )
}

export default SignIn