import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const settings = await prisma.integrationSettings.findUnique({
    where: { userId: session.user.id },
    select: {
      sheetsEnabled: true, sheetId: true, tabName: true, columnMapping: true,
      gmailEnabled: true, sellsyEnabled: true, pushEnabled: true,
    },
  })

  return <OnboardingWizard initialSettings={settings} />
}
