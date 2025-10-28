import {LoginForm} from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="bg-white flex min-h-svh flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-1 self-center font-medium text-black">
          <div className="bg-black text-white flex size-6 items-center justify-center rounded-sm">
            M
          </div>
          entorae
        </a>
        <LoginForm />
      </div>
    </div>
  )
}