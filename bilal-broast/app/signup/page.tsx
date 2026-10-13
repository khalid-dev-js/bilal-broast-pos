import { AuthLayout, SignupForm } from '@/components/auth/AuthForms'
export const metadata = { title: 'Sign up | Bilal Broast', description: 'Create a Bilal Broast account.' }
export default function SignupPage() { return <AuthLayout mode="signup"><SignupForm /></AuthLayout> }
