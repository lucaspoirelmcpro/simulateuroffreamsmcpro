import { PrismaClient } from '@prisma/client'
import { subDays, subHours, addDays } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Sales Command Center...')

  // Create demo user (admin)
  const user = await prisma.user.upsert({
    where: { email: 'admin@mycoacpro.fr' },
    create: {
      name: 'Admin Demo',
      email: 'admin@mycoacpro.fr',
      role: 'ADMIN',
    },
    update: {},
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'sales@mycoacpro.fr' },
    create: {
      name: 'Jean Dupont',
      email: 'sales@mycoacpro.fr',
      role: 'SALES',
    },
    update: {},
  })

  // Create default pipeline with stages
  const pipeline = await prisma.pipeline.upsert({
    where: { id: 'default-pipeline' },
    create: {
      id: 'default-pipeline',
      name: 'Prospection Clubs',
      stageType: 'PROSPECTING',
      isDefault: true,
      staleAfterDays: 14,
    },
    update: { isDefault: true },
  })

  const stages = await Promise.all([
    prisma.pipelineStage.upsert({
      where: { id: 'stage-prospect' },
      create: { id: 'stage-prospect', pipelineId: pipeline.id, name: 'Prospect', order: 0, color: '#94a3b8', isDefault: true },
      update: {},
    }),
    prisma.pipelineStage.upsert({
      where: { id: 'stage-contacte' },
      create: { id: 'stage-contacte', pipelineId: pipeline.id, name: 'Contacté', order: 1, color: '#60a5fa' },
      update: {},
    }),
    prisma.pipelineStage.upsert({
      where: { id: 'stage-qualify' },
      create: { id: 'stage-qualify', pipelineId: pipeline.id, name: 'Qualification', order: 2, color: '#a78bfa' },
      update: {},
    }),
    prisma.pipelineStage.upsert({
      where: { id: 'stage-demo' },
      create: { id: 'stage-demo', pipelineId: pipeline.id, name: 'Démo planifiée', order: 3, color: '#f59e0b', requiresNextStep: true },
      update: {},
    }),
    prisma.pipelineStage.upsert({
      where: { id: 'stage-proposition' },
      create: { id: 'stage-proposition', pipelineId: pipeline.id, name: 'Proposition', order: 4, color: '#f97316' },
      update: {},
    }),
    prisma.pipelineStage.upsert({
      where: { id: 'stage-gagne' },
      create: { id: 'stage-gagne', pipelineId: pipeline.id, name: 'Gagné', order: 5, color: '#22c55e' },
      update: {},
    }),
  ])

  const [sProspect, sContacte, sQualify, sDemo, sProposition, sGagne] = stages

  // Create orgs (clubs)
  const orgs = await Promise.all([
    prisma.org.upsert({ where: { id: 'org-psg' }, create: { id: 'org-psg', name: 'Paris Saint-Germain', domain: 'psg.fr', country: 'France', segment: 'LIGUE1', ownerId: user.id }, update: {} }),
    prisma.org.upsert({ where: { id: 'org-om' }, create: { id: 'org-om', name: 'Olympique de Marseille', domain: 'om.net', country: 'France', segment: 'LIGUE1', ownerId: user2.id }, update: {} }),
    prisma.org.upsert({ where: { id: 'org-oL' }, create: { id: 'org-oL', name: 'Olympique Lyonnais', domain: 'ol.fr', country: 'France', segment: 'LIGUE1', ownerId: user.id }, update: {} }),
    prisma.org.upsert({ where: { id: 'org-rennes' }, create: { id: 'org-rennes', name: 'Stade Rennais FC', domain: 'staderennais.com', country: 'France', segment: 'LIGUE1', ownerId: user2.id }, update: {} }),
    prisma.org.upsert({ where: { id: 'org-nice' }, create: { id: 'org-nice', name: 'OGC Nice', domain: 'ogcnice.com', country: 'France', segment: 'LIGUE1', ownerId: user.id }, update: {} }),
    prisma.org.upsert({ where: { id: 'org-metz' }, create: { id: 'org-metz', name: 'FC Metz', domain: 'fcmetz.com', country: 'France', segment: 'LIGUE2', ownerId: user2.id }, update: {} }),
  ])

  const [orgPSG, orgOM, orgOL, orgRennes, orgNice, orgMetz] = orgs

  // Demo contacts data
  const contactsData = [
    { id: 'c-1', firstname: 'Thomas', lastname: 'Martin', email: 'tmartin@psg.fr', title: 'Directeur Sportif', orgId: orgPSG.id, ownerId: user.id, stageId: sDemo.id, tags: ['VIP', 'Decision maker'] },
    { id: 'c-2', firstname: 'Sophie', lastname: 'Laurent', email: 'slaurent@psg.fr', title: 'Responsable Formation', orgId: orgPSG.id, ownerId: user.id, stageId: sContacte.id, tags: ['Formation'] },
    { id: 'c-3', firstname: 'Marc', lastname: 'Dubois', email: 'mdubois@om.net', title: 'DTN', orgId: orgOM.id, ownerId: user2.id, stageId: sQualify.id, tags: ['Decision maker'] },
    { id: 'c-4', firstname: 'Julie', lastname: 'Bernard', email: 'jbernard@om.net', title: 'Coach Pro', orgId: orgOM.id, ownerId: user2.id, stageId: sProposition.id, tags: ['Coach'] },
    { id: 'c-5', firstname: 'Pierre', lastname: 'Petit', email: 'ppetit@ol.fr', title: 'Responsable Académie', orgId: orgOL.id, ownerId: user.id, stageId: sGagne.id, tags: ['Académie', 'VIP'] },
    { id: 'c-6', firstname: 'Marie', lastname: 'Simon', email: 'msimon@staderennais.com', title: 'Secrétaire Générale', orgId: orgRennes.id, ownerId: user2.id, stageId: sProspect.id, tags: [] },
    { id: 'c-7', firstname: 'Antoine', lastname: 'Leroy', email: 'aleroy@ogcnice.com', title: 'Directeur Général', orgId: orgNice.id, ownerId: user.id, stageId: sContacte.id, tags: ['Decision maker'] },
    { id: 'c-8', firstname: 'Nathalie', lastname: 'Moreau', email: 'nmoreau@fcmetz.com', title: 'Présidente', orgId: orgMetz.id, ownerId: user2.id, stageId: sQualify.id, tags: ['Decision maker', 'VIP'] },
  ]

  for (const c of contactsData) {
    await prisma.contact.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        firstname: c.firstname,
        lastname: c.lastname,
        email: c.email,
        title: c.title,
        orgId: c.orgId,
        ownerId: c.ownerId,
        tags: c.tags,
        source: 'SEED',
      },
      update: {},
    })

    // Add to pipeline
    await prisma.contactPipelineState.upsert({
      where: { contactId_pipelineId: { contactId: c.id, pipelineId: pipeline.id } },
      create: {
        contactId: c.id,
        pipelineId: pipeline.id,
        currentStageId: c.stageId,
        status: c.stageId === sGagne.id ? 'WON' : 'OPEN',
        lastActivityAt: subDays(new Date(), Math.floor(Math.random() * 20)),
      },
      update: {},
    })

    // Stage history
    await prisma.contactStageHistory.upsert({
      where: { id: `history-${c.id}-initial` },
      create: {
        id: `history-${c.id}-initial`,
        contactId: c.id,
        pipelineId: pipeline.id,
        toStageId: sProspect.id,
        changedByUserId: user.id,
        changedAt: subDays(new Date(), 60),
        reason: 'Import initial',
      },
      update: {},
    })

    // Create interactions
    const interactionTypes = [
      { type: 'EMAIL_OUT', daysAgo: 45, summary: `Email d'introduction envoyé` },
      { type: 'EMAIL_IN', daysAgo: 43, summary: `Réponse reçue - intérêt confirmé` },
      { type: 'CALL', daysAgo: 35, summary: `Appel de qualification - 20min` },
      { type: 'EMAIL_OUT', daysAgo: 20, summary: `Envoi de la documentation` },
      { type: 'MEETING', daysAgo: 10, summary: `RDV visio - présentation solution` },
    ]

    for (let i = 0; i < interactionTypes.length; i++) {
      const it = interactionTypes[i]
      await prisma.interaction.upsert({
        where: { id: `int-${c.id}-${i}` },
        create: {
          id: `int-${c.id}-${i}`,
          contactId: c.id,
          type: it.type as any,
          occurredAt: subDays(new Date(), it.daysAgo + Math.floor(Math.random() * 5)),
          source: i < 4 ? 'GMAIL' : 'MANUAL',
          summary: it.summary,
        },
        update: {},
      })
    }

    // Demo for some
    if (['c-1', 'c-3', 'c-5'].includes(c.id)) {
      await prisma.interaction.upsert({
        where: { id: `int-${c.id}-demo` },
        create: {
          id: `int-${c.id}-demo`,
          contactId: c.id,
          type: 'DEMO',
          occurredAt: subDays(new Date(), 7),
          source: 'MANUAL',
          summary: 'Démo MyCoach Pro - plateforme complète',
        },
        update: {},
      })
    }

    // Create metrics snapshot
    const daysAgo = Math.floor(Math.random() * 15)
    await prisma.metricsSnapshot.upsert({
      where: { contactId_pipelineId: { contactId: c.id, pipelineId: pipeline.id } },
      create: {
        contactId: c.id,
        pipelineId: pipeline.id,
        interactionsCount: 5,
        emailsOutCount: 2,
        emailsInCount: 1,
        meetingsCount: 1,
        demosCount: ['c-1', 'c-3', 'c-5'].includes(c.id) ? 1 : 0,
        callsCount: 1,
        lastInteractionAt: subDays(new Date(), daysAgo),
        lastEmailAt: subDays(new Date(), daysAgo + 2),
        lastEmailOutAt: subDays(new Date(), 20),
        lastEmailInAt: subDays(new Date(), 18),
        lastMeetingAt: subDays(new Date(), 10),
        nextMeetingAt: daysAgo < 5 ? addDays(new Date(), 7) : null,
        replyDetected: Math.random() > 0.3,
        daysSinceLastActivity: daysAgo,
        staleFlag: daysAgo > 14,
        nextStepMissing: c.stageId === sDemo.id && Math.random() > 0.5,
        sellsyStage: ['c-1', 'c-4', 'c-5'].includes(c.id) ? 'En cours' : null,
        sellsyAmount: ['c-1', 'c-4', 'c-5'].includes(c.id) ? Math.floor(Math.random() * 20000) + 5000 : null,
      },
      update: {},
    })
  }

  // Create tasks
  await prisma.task.upsert({
    where: { id: 'task-1' },
    create: {
      id: 'task-1',
      contactId: 'c-1',
      ownerId: user.id,
      type: 'MEETING',
      status: 'OPEN',
      dueDate: addDays(new Date(), 3),
      notes: 'Relance démo PSG',
    },
    update: {},
  })

  await prisma.task.upsert({
    where: { id: 'task-2' },
    create: {
      id: 'task-2',
      contactId: 'c-3',
      ownerId: user2.id,
      type: 'EMAIL',
      status: 'OPEN',
      dueDate: addDays(new Date(), 1),
      notes: 'Envoyer proposition commerciale OM',
    },
    update: {},
  })

  console.log(`✅ Seeded:`)
  console.log(`   - 2 utilisateurs`)
  console.log(`   - 6 clubs/organisations`)
  console.log(`   - ${contactsData.length} contacts`)
  console.log(`   - 1 pipeline avec ${stages.length} stages`)
  console.log(`   - ${contactsData.length * 5} interactions environ`)
  console.log(`   - MetricsSnapshot pour chaque contact`)
  console.log()
  console.log(`🔑 Vous pouvez vous connecter avec:`)
  console.log(`   Email: admin@mycoacpro.fr (Admin)`)
  console.log(`   Email: sales@mycoacpro.fr (Sales)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
