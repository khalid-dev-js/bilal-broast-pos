import { AuthLayout, LoginForm } from '@/components/auth/AuthForms'
export const metadata = { title: 'Log in | Bilal Broast', description: 'Log in to your Bilal Broast account.' }
export default function LoginPage() { return <AuthLayout mode="login"><LoginForm /></AuthLayout> }
