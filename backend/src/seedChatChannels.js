const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedChatChannels() {
  try {
    console.log('🔄 Seeding chat channels...');

    // Get all institutions
    const institutions = await prisma.institution.findMany({
      include: {
        groups: true
      }
    });

    if (institutions.length === 0) {
      console.log('❌ No institutions found. Please seed institutions first.');
      return;
    }

    for (const institution of institutions) {
      console.log(`📋 Processing institution: ${institution.name}`);

      // 1. Create institution-wide chat channel
      const existingInstitutionChannel = await prisma.chatChannel.findFirst({
        where: {
          institutionId: institution.id,
          type: 'INSTITUTION_CHAT'
        }
      });

      if (!existingInstitutionChannel) {
        await prisma.chatChannel.create({
          data: {
            name: `${institution.name} - Alle`,
            type: 'INSTITUTION_CHAT',
            institutionId: institution.id
          }
        });
        console.log(`✅ Created institution chat for ${institution.name}`);
      }

      // 2. Create educator-only chat channel
      const existingEducatorChannel = await prisma.chatChannel.findFirst({
        where: {
          institutionId: institution.id,
          type: 'GROUP_CHAT',
          groupId: null // Educator-only channels have no groupId
        }
      });

      if (!existingEducatorChannel) {
        await prisma.chatChannel.create({
          data: {
            name: `${institution.name} - Erzieher Chat`,
            type: 'GROUP_CHAT',
            institutionId: institution.id
            // No groupId since this is for all educators in the institution
          }
        });
        console.log(`✅ Created educator chat for ${institution.name}`);
      }

      // 3. Create group chat channels for each group
      for (const group of institution.groups) {
        const existingGroupChannel = await prisma.chatChannel.findFirst({
          where: {
            groupId: group.id,
            type: 'GROUP_CHAT'
          }
        });

        if (!existingGroupChannel) {
          await prisma.chatChannel.create({
            data: {
              name: `${group.name} Chat`,
              type: 'GROUP_CHAT',
              groupId: group.id,
              institutionId: institution.id
            }
          });
          console.log(`✅ Created group chat for ${group.name}`);
        }
      }
    }

    console.log('🎉 Chat channels seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding chat channels:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedChatChannels()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}

module.exports = { seedChatChannels }; 