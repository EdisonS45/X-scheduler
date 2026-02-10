'use client'

import { useState } from 'react'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setToken = useAuthStore((s) => s.setToken)
  const router = useRouter()

  const submit = async () => {
    const res = await api.post('/auth/login', { email, password })
    setToken(res.data.token)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-card">
        <h1 className="text-xl font-semibold mb-6">Sign in</h1>

        <input
          className="w-full mb-3 border rounded-lg px-3 py-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 border rounded-lg px-3 py-2"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryMuted"
        >
          Login
        </button>
      </div>
    </div>
  )
}
