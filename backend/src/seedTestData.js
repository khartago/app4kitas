require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();

// Helper function to log activities
const logActivity = async (userId, action, entity, entityId, details, institutionId = null, groupId = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        institutionId,
        groupId,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

async function main() {
  // Wipe all data (order matters due to FKs)
  console.log('🧹 Cleaning up existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.personalTask.deleteMany();
  await prisma.note.deleteMany();
  await prisma.failedLogin.deleteMany();
  await prisma.message.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.chatChannel.deleteMany();
  await prisma.checkInLog.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.child.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  await prisma.closedDay.deleteMany();
  await prisma.institution.deleteMany();

  console.log('✅ Database cleaned');

  // Create Super Admin FIRST
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@app4kitas.de',
      password: await bcrypt.hash('superadmin', parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      avatarUrl: faker.image.avatar(),
    },
  });

  // Log super admin creation
  await logActivity(
    superAdmin.id,
    'USER_CREATED',
    'User',
    superAdmin.id,
    `Created SUPER_ADMIN user: ${superAdmin.name} (${superAdmin.email})`,
    null,
    null
  );

  // 1. Institutions
  const institutions = [];
  for (let i = 0; i < 2; i++) {
    const institution = await prisma.institution.create({
      data: {
        name: `Kita ${faker.word.noun()} ${faker.location.city()}`,
        address: faker.location.streetAddress(),
        openingTime: '07:00',
        closingTime: '17:00',
        closedDays: {
          create: [{
            date: faker.date.soon({ days: 30 }),
            reason: 'Ferien',
          }],
        },
      },
      include: { closedDays: true },
    });
    institutions.push(institution);

    // Log institution creation
    await logActivity(
      superAdmin.id,
      'INSTITUTION_CREATED',
      'Institution',
      institution.id,
      `Created institution: ${institution.name}`,
      institution.id,
      null
    );
  }

  // 2. Admins (1 per institution)
  const admins = [];
  for (const inst of institutions) {
    const admin = await prisma.user.create({
      data: {
        email: `admin_${inst.id}@app4kitas.de`,
        password: await bcrypt.hash('admin', parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10),
        name: `Admin ${inst.name}`,
        role: 'ADMIN',
        institutionId: inst.id,
        avatarUrl: faker.image.avatar(),
      },
    });
    admins.push(admin);

    // Log admin creation
    await logActivity(
      superAdmin.id,
      'USER_CREATED',
      'User',
      admin.id,
      `Created ADMIN user: ${admin.name} (${admin.email})`,
      inst.id,
      null
    );
  }

  // 3. Groups (2 per institution)
  const groups = [];
  for (const inst of institutions) {
    for (let i = 0; i < 2; i++) {
      const group = await prisma.group.create({
        data: {
          name: `Gruppe ${faker.color.human()} ${faker.animal.type()}`,
          institutionId: inst.id,
        },
      });
      groups.push(group);

      // Log group creation
      await logActivity(
        superAdmin.id,
        'GROUP_CREATED',
        'Group',
        group.id,
        `Created group: ${group.name}`,
        inst.id,
        group.id
      );
    }
  }

  // 4. Educators (2 per group)
  const educators = [];
  const groupEducatorsMap = {};
  for (const group of groups) {
    groupEducatorsMap[group.id] = [];
    for (let i = 0; i < 2; i++) {
      const educator = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: await bcrypt.hash('educator', parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10),
          name: faker.person.fullName(),
          role: 'EDUCATOR',
          institutionId: group.institutionId,
          groups: { connect: { id: group.id } },
          avatarUrl: faker.image.avatar(),
        },
      });
      educators.push(educator);
      groupEducatorsMap[group.id].push(educator);
      // Log educator creation
      await logActivity(
        superAdmin.id,
        'USER_CREATED',
        'User',
        educator.id,
        `Created EDUCATOR user: ${educator.name} (${educator.email})`,
        group.institutionId,
        group.id
      );
    }
  }

  // 5. Parents (3 per group, some with multiple children)
  const parents = [];
  for (const group of groups) {
    for (let i = 0; i < 3; i++) {
      const parent = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: await bcrypt.hash('parent', parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10),
          name: faker.person.fullName(),
          role: 'PARENT',
          institutionId: group.institutionId,
          avatarUrl: faker.image.avatar(),
        },
      });
      parents.push(parent);

      // Log parent creation
      await logActivity(
        superAdmin.id,
        'USER_CREATED',
        'User',
        parent.id,
        `Created PARENT user: ${parent.name} (${parent.email})`,
        group.institutionId,
        group.id
      );
    }
  }

  // 6. Children (5 per group, each with 1-2 parents)
  const children = [];
  for (const group of groups) {
    const groupParents = parents.filter(p => p.institutionId === group.institutionId);
    for (let i = 0; i < 5; i++) {
      const childParents = faker.helpers.arrayElements(groupParents, faker.number.int({ min: 1, max: 2 }));
      const qrCodeSecret = crypto.randomBytes(16).toString('hex');
      const child = await prisma.child.create({
        data: {
          name: faker.person.firstName() + ' ' + faker.person.lastName(),
          birthdate: faker.date.between({ from: '2017-01-01', to: '2021-12-31' }),
          groupId: group.id,
          parents: { connect: childParents.map(p => ({ id: p.id })) },
          qrCodeSecret,
          institutionId: group.institutionId,
          photoUrl: faker.image.avatar(),
        },
      });
      children.push(child);

      // Log child creation
      await logActivity(
        superAdmin.id,
        'CHILD_CREATED',
        'Child',
        child.id,
        `Created child: ${child.name}`,
        group.institutionId,
        group.id
      );
    }
  }

  // 7. Create Chat Channels for each institution and group
  const chatChannels = [];
  
  // Institution-wide channels
  for (const institution of institutions) {
    const institutionChannel = await prisma.chatChannel.create({
      data: {
        name: `${institution.name} Chat`,
        type: 'INSTITUTION_CHAT',
        institutionId: institution.id,
      },
    });
    chatChannels.push(institutionChannel);

    // Log channel creation
    await logActivity(
      superAdmin.id,
      'CHANNEL_CREATED',
      'ChatChannel',
      institutionChannel.id,
      `Created institution channel: ${institutionChannel.name}`,
      institution.id,
      null
    );

    // Create educator-only group chat
    const educatorChannel = await prisma.chatChannel.create({
      data: {
        name: `${institution.name} - Erzieher Chat`,
        type: 'GROUP_CHAT',
        institutionId: institution.id,
        // No groupId since this is for all educators in the institution
      },
    });
    chatChannels.push(educatorChannel);

    // Log educator channel creation
    await logActivity(
      superAdmin.id,
      'CHANNEL_CREATED',
      'ChatChannel',
      educatorChannel.id,
      `Created educator-only channel: ${educatorChannel.name}`,
      institution.id,
      null
    );
  }

  // Group channels
  for (const group of groups) {
    const groupChannel = await prisma.chatChannel.create({
      data: {
        name: `${group.name} Chat`,
        type: 'GROUP_CHAT',
        institutionId: group.institutionId,
        groupId: group.id,
      },
    });
    chatChannels.push(groupChannel);

    // Log channel creation
    await logActivity(
      superAdmin.id,
      'CHANNEL_CREATED',
      'ChatChannel',
      groupChannel.id,
      `Created group channel: ${groupChannel.name}`,
      group.institutionId,
      group.id
    );
  }

  // 8. Create Direct Messages between users in same institution
  const directMessages = [];
  for (const institution of institutions) {
    const institutionUsers = [...admins, ...educators, ...parents].filter(u => u.institutionId === institution.id);
    
    // Create some direct message conversations
    for (let i = 0; i < Math.min(5, institutionUsers.length - 1); i++) {
      const user1 = institutionUsers[i];
      const user2 = institutionUsers[i + 1];
      
      const directMessage = await prisma.directMessage.create({
        data: {
          user1Id: user1.id,
          user2Id: user2.id,
        },
      });
      directMessages.push(directMessage);

      // Log direct message creation
      await logActivity(
        superAdmin.id,
        'DIRECT_MESSAGE_CREATED',
        'DirectMessage',
        directMessage.id,
        `Created DM between ${user1.name} and ${user2.name}`,
        institution.id,
        null
      );
    }
  }

  // 9. Create Messages in channels and direct messages
  const messages = [];
  
  // Messages in institution channels
  for (const channel of chatChannels.filter(c => c.type === 'INSTITUTION_CHAT')) {
    const channelUsers = [...admins, ...educators, ...parents].filter(u => u.institutionId === channel.institutionId);
    
    for (let i = 0; i < 3; i++) {
      const sender = faker.helpers.arrayElement(channelUsers);
      const message = await prisma.message.create({
        data: {
          content: faker.lorem.sentence(),
          senderId: sender.id,
          channelId: channel.id,
          fileUrl: Math.random() < 0.3 ? faker.image.urlPicsumPhotos() : null,
          fileType: Math.random() < 0.3 ? 'IMAGE' : null,
        },
      });
      messages.push(message);

      // Log message creation
      await logActivity(
        sender.id,
        'MESSAGE_SENT',
        'Message',
        message.id,
        `Sent message in ${channel.name}`,
        channel.institutionId,
        channel.groupId
      );
    }
  }

  // Messages in group channels
  for (const channel of chatChannels.filter(c => c.type === 'GROUP_CHAT')) {
    let groupEducators = [];
    
    if (channel.groupId) {
      // Regular group channel
      groupEducators = groupEducatorsMap[channel.groupId] || [];
    } else {
      // Educator-only channel (no groupId)
      groupEducators = educators.filter(e => e.institutionId === channel.institutionId);
    }
    
    for (let i = 0; i < 2; i++) {
      const sender = faker.helpers.arrayElement(groupEducators);
      if (!sender) continue;
      const message = await prisma.message.create({
        data: {
          content: faker.lorem.sentence(),
          senderId: sender.id,
          channelId: channel.id,
          fileUrl: Math.random() < 0.2 ? faker.image.urlPicsumPhotos() : null,
          fileType: Math.random() < 0.2 ? 'IMAGE' : null,
        },
      });
      messages.push(message);

      // Log message creation
      await logActivity(
        sender.id,
        'MESSAGE_SENT',
        'Message',
        message.id,
        `Sent message in ${channel.name}`,
        channel.institutionId,
        channel.groupId
      );
    }
  }

  // Messages in direct messages
  for (const dm of directMessages) {
    for (let i = 0; i < 2; i++) {
      const sender = faker.helpers.arrayElement([dm.user1Id, dm.user2Id]);
      const message = await prisma.message.create({
        data: {
          content: faker.lorem.sentence(),
          senderId: sender,
          directMessageId: dm.id,
          fileUrl: Math.random() < 0.1 ? faker.image.urlPicsumPhotos() : null,
          fileType: Math.random() < 0.1 ? 'IMAGE' : null,
        },
      });
      messages.push(message);

      // Log message creation
      await logActivity(
        sender,
        'MESSAGE_SENT',
        'Message',
        message.id,
        `Sent direct message`,
        null,
        null
      );
    }
  }

  // 10. CheckIns (simulate attendance, some late, some missing check-out)
  for (const child of children) {
    const educator = educators.find(e => e.institutionId === child.groupId);
    // 3 days of check-ins
    for (let d = 0; d < 3; d++) {
      const day = new Date();
      day.setDate(day.getDate() - d);
      day.setHours(8 + faker.number.int({ min: 0, max: 2 }), faker.number.int({ min: 0, max: 59 }), 0, 0);
      await prisma.checkInLog.create({
        data: {
          childId: child.id,
          actorId: superAdmin.id,
          type: 'IN',
          timestamp: new Date(day),
          method: 'QR',
        },
      });

      // Log check-in activity
      await logActivity(
        superAdmin.id,
        'CHECKIN_RECORDED',
        'CheckIn',
        child.id,
        `Check-in recorded for ${child.name}`,
        child.institutionId,
        child.groupId
      );

      // 80% chance of check-out
      if (Math.random() < 0.8) {
        const outTime = new Date(day);
        outTime.setHours(day.getHours() + 8, day.getMinutes() + faker.number.int({ min: 0, max: 30 }));
        await prisma.checkInLog.create({
          data: {
            childId: child.id,
            actorId: superAdmin.id,
            type: 'OUT',
            timestamp: outTime,
            method: 'QR',
          },
        });

        // Log check-out activity
        await logActivity(
          superAdmin.id,
          'CHECKIN_RECORDED',
          'CheckIn',
          child.id,
          `Check-out recorded for ${child.name}`,
          child.institutionId,
          child.groupId
        );
      }
    }
  }

  // 11. Notifications
  for (const user of [...admins, ...educators, ...parents]) {
    await prisma.notificationLog.create({
      data: {
        userId: user.id,
        title: faker.lorem.words(3),
        body: faker.lorem.sentence(),
        senderId: superAdmin.id,
        priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
        read: Math.random() < 0.3, // 30% chance of being read
      },
    });
  }

  // 12. Personal Tasks for educators and admins
  const allUsers = [superAdmin, ...admins, ...educators, ...parents];
  for (const user of [...admins, ...educators]) {
    for (let i = 0; i < faker.number.int({ min: 2, max: 5 }); i++) {
      const completed = Math.random() < 0.3; // 30% chance of being completed
      await prisma.personalTask.create({
        data: {
          userId: user.id,
          title: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
          completed,
          dueDate: faker.date.future(),
        },
      });
    }
  }

  // 13. DeviceTokens (one per user)
  for (const user of allUsers) {
    await prisma.deviceToken.create({
      data: {
        userId: user.id,
        token: crypto.randomBytes(24).toString('hex'),
      },
    });
  }

  // 13.5. Notes for children (2-4 notes per child)
  console.log('📝 Creating notes for children...');
  const noteTemplates = [
    'Heute hat {childName} sehr gut mit den anderen Kindern gespielt. Besonders beim Bauen mit den Bausteinen war {childName} sehr kreativ und hat ein tolles Haus gebaut.',
    '{childName} hat heute beim Malen große Fortschritte gemacht. Die Feinmotorik entwickelt sich sehr gut und {childName} kann bereits gut mit dem Pinsel umgehen.',
    'Beim gemeinsamen Singen und Tanzen war {childName} sehr aktiv und hat mit viel Freude mitgemacht. Die soziale Entwicklung ist auf einem guten Weg.',
    '{childName} hat heute beim Essen sehr gut aufgepasst und die Tischmanieren verbessert. Es wurde ordentlich mit Messer und Gabel gegessen.',
    'Beim Spielen im Garten hat {childName} viel Interesse an den Pflanzen gezeigt. Wir haben über verschiedene Blumen und ihre Farben gesprochen.',
    '{childName} hat heute beim Basteln sehr konzentriert gearbeitet. Die Ausdauer und Geduld beim Schneiden und Kleben haben sich deutlich verbessert.',
    'Beim Vorlesen war {childName} sehr aufmerksam und hat viele Fragen gestellt. Das Sprachverständnis und die Neugier sind sehr ausgeprägt.',
    '{childName} hat heute beim Turnen große Fortschritte gemacht. Die Koordination und das Gleichgewicht entwickeln sich sehr gut.',
    'Beim gemeinsamen Spielen hat {childName} gelernt, sich abzuwechseln und zu teilen. Die sozialen Fähigkeiten entwickeln sich positiv.',
    '{childName} hat heute beim Experimentieren mit Wasser und Sand viel Freude gehabt. Die Neugier und der Entdeckerdrang sind sehr ausgeprägt.'
  ];

  for (const child of children) {
    const childEducators = groupEducatorsMap[child.groupId] || [];
    if (childEducators.length > 0) {
      const numNotes = faker.number.int({ min: 2, max: 4 });
      for (let i = 0; i < numNotes; i++) {
        const educator = faker.helpers.arrayElement(childEducators);
        const template = faker.helpers.arrayElement(noteTemplates);
        const content = template.replace(/{childName}/g, child.name);
        
        await prisma.note.create({
          data: {
            content,
            childId: child.id,
            educatorId: educator.id,
            createdAt: faker.date.recent({ days: 30 }),
          },
        });

        // Log note creation activity
        await logActivity(
          educator.id,
          'NOTE_CREATED',
          'Note',
          child.id,
          `Note created for ${child.name}`,
          child.institutionId,
          child.groupId
        );
      }
    }
  }

  // 14. Failed Login attempts (for security testing)
  for (let i = 0; i < 5; i++) {
    await prisma.failedLogin.create({
      data: {
        email: faker.internet.email(),
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
      },
    });
  }

  // Add some login activities
  for (const user of allUsers) {
    // Add login activity
    await logActivity(
      user.id,
      'USER_LOGIN',
      'User',
      user.id,
      `User logged in: ${user.name} (${user.email})`,
      user.institutionId || null,
      null
    );
  }

  // Print summary
  console.log('🎉 Mock-Datenbank erfolgreich erstellt:');
  console.log(`Institutionen: ${institutions.length}`);
  console.log(`Admins: ${admins.length}`);
  console.log(`Erzieher: ${educators.length}`);
  console.log(`Eltern: ${parents.length}`);
  console.log(`Gruppen: ${groups.length}`);
  console.log(`Kinder: ${children.length}`);
  console.log(`Chat-Kanäle: ${chatChannels.length}`);
  console.log(`Direktnachrichten: ${directMessages.length}`);
  console.log(`Nachrichten: ${messages.length}`);
  
  // Count activity logs
  const activityCount = await prisma.activityLog.count();
  const taskCount = await prisma.personalTask.count();
  const notificationCount = await prisma.notificationLog.count();
  const deviceTokenCount = await prisma.deviceToken.count();
  const failedLoginCount = await prisma.failedLogin.count();
  const noteCount = await prisma.note.count();
  
  console.log(`Aktivitäts-Logs: ${activityCount}`);
  console.log(`Persönliche Aufgaben: ${taskCount}`);
  console.log(`Benachrichtigungen: ${notificationCount}`);
  console.log(`Geräte-Tokens: ${deviceTokenCount}`);
  console.log(`Fehlgeschlagene Logins: ${failedLoginCount}`);
  console.log(`Notizen: ${noteCount}`);

  // Write all accounts to accounts.txt
  let accountsTxt = '';
  accountsTxt += '[Super Admin]\n';
  accountsTxt += `E-Mail: ${superAdmin.email} | Name: ${superAdmin.name} | Passwort: superadmin\n`;
  accountsTxt += '\n[Admins]\n';
  admins.forEach(a => {
    accountsTxt += `E-Mail: ${a.email} | Name: ${a.name} | Passwort: admin\n`;
  });
  accountsTxt += '\n[Erzieher]\n';
  educators.forEach(e => {
    accountsTxt += `E-Mail: ${e.email} | Name: ${e.name} | Passwort: educator\n`;
  });
  accountsTxt += '\n[Eltern]\n';
  parents.forEach(p => {
    accountsTxt += `E-Mail: ${p.email} | Name: ${p.name} | Passwort: parent\n`;
  });
  fs.writeFileSync('accounts.txt', accountsTxt);
  
  console.log('📝 Account-Daten in accounts.txt gespeichert');
}

// Update existing notifications to have a senderId (for testing)
async function updateExistingNotifications() {
  try {
    // Get the first admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminUser) {
      // Update all notifications that don't have a senderId
      const updated = await prisma.notificationLog.updateMany({
        where: {
          senderId: null
        },
        data: {
          senderId: adminUser.id
        }
      });

      console.log(`Updated ${updated.count} notifications with senderId`);
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
  }
}

// Call the main function
main()
  .then(() => {
    console.log('✅ Seed data created successfully');
    return updateExistingNotifications();
  })
  .then(() => {
    console.log('✅ All data updated successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
