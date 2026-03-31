'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/pipeline')
  }, [session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 mb-4">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sales Command Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Plateforme commerciale interne MyCoach Pro
          </p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">
              Connexion sécurisée
            </span>
          </div>
        </div>

        {/* Sign in button */}
        <Button
          className="w-full h-12 text-base font-medium"
          onClick={() => signIn('google', { callbackUrl: '/pipeline' })}
        >
          <Chrome className="mr-2 h-5 w-5" />
          Continuer avec Google
        </Button>

        <p className="text-xs text-center text-slate-400">
          Accès restreint aux membres de l'équipe MyCoach Pro.
          <br />
          Vos données Google restent sécurisées et chiffrées.
        </p>
      </div>
    </div>
  )
}
