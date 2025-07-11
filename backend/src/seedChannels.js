const prisma = require('./models/prismaClient');

async function seedChannels() {
  // Create institution-wide chat channels
  const institutions = await prisma.institution.findMany();
  for (const institution of institutions) {
    const existing = await prisma.chatChannel.findFirst({
      where: { institutionId: institution.id, type: 'INSTITUTION_CHAT' }
    });
    if (!existing) {
      await prisma.chatChannel.create({
        data: {
          name: `${institution.name} Chat`,
          type: 'INSTITUTION_CHAT',
          institutionId: institution.id,
          participants: {
            connect: (await prisma.user.findMany({ where: { institutionId: institution.id } })).map(u => ({ id: u.id }))
          }
        }
      });
      console.log(`Created institution chat for ${institution.name}`);
    }
  }

  // Create group chat channels
  const groups = await prisma.group.findMany({ include: { institution: true } });
  for (const group of groups) {
    const existing = await prisma.chatChannel.findFirst({
      where: { groupId: group.id, type: 'GROUP_CHAT' }
    });
    if (!existing) {
      await prisma.chatChannel.create({
        data: {
          name: `${group.name} Chat`,
          type: 'GROUP_CHAT',
          institutionId: group.institutionId,
          groupId: group.id,
          participants: {
            connect: [
              ...(await prisma.user.findMany({ where: { groups: { some: { id: group.id } } } })).map(u => ({ id: u.id })),
              ...(await prisma.user.findMany({ where: { role: 'ADMIN', institutionId: group.institutionId } })).map(u => ({ id: u.id }))
            ]
          }
        }
      });
      console.log(`Created group chat for ${group.name}`);
    }
  }

  await prisma.$disconnect();
}

seedChannels().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 