import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/pipeline/CommandPalette'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar session={session} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
      <CommandPalette />
    </div>
  )
}
