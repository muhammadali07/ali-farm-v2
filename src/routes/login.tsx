import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginPage } from '../components/LoginPage'

export const Route = createFileRoute('/login')({
    component: Login,
})

function Login() {
    const navigate = useNavigate()

    return (
        <LoginPage
            onLoginSuccess={() => navigate({ to: '/dashboard' })}
            onBack={() => navigate({ to: '/' })}
        />
    )
}
