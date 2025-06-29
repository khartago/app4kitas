require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  // Wipe all data (order matters due to FKs)
  await prisma.checkInLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.child.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Institutions
  const institutions = [];
  for (let i = 0; i < 2; i++) {
    institutions.push(await prisma.institution.create({
      data: {
        name: `Kita ${faker.word.noun()} ${faker.location.city()}`,
        address: faker.location.streetAddress(),
      },
    }));
  }

  // 2. Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@app4kitas.de',
      password: await bcrypt.hash('superadmin', 10),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  // 3. Admins (1 per institution)
  const admins = [];
  for (const inst of institutions) {
    admins.push(await prisma.user.create({
      data: {
        email: `admin_${inst.id}@app4kitas.de`,
        password: await bcrypt.hash('admin', 10),
        name: `Admin ${inst.name}`,
        role: 'ADMIN',
        institutionId: inst.id,
      },
    }));
  }

  // 4. Groups (2 per institution)
  const groups = [];
  for (const inst of institutions) {
    for (let i = 0; i < 2; i++) {
      groups.push(await prisma.group.create({
        data: {
          name: `Gruppe ${faker.color.human()} ${faker.animal.type()}`,
          institutionId: inst.id,
        },
      }));
    }
  }

  // 5. Educators (2 per group)
  const educators = [];
  for (const group of groups) {
    for (let i = 0; i < 2; i++) {
      const educator = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: await bcrypt.hash('educator', 10),
          name: faker.person.fullName(),
          role: 'EDUCATOR',
          institutionId: group.institutionId,
          groups: { connect: { id: group.id } },
        },
      });
      educators.push(educator);
    }
  }

  // 6. Parents (3 per group, some with multiple children)
  const parents = [];
  for (const group of groups) {
    for (let i = 0; i < 3; i++) {
      const parent = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: await bcrypt.hash('parent', 10),
          name: faker.person.fullName(),
          role: 'PARENT',
          institutionId: group.institutionId,
        },
      });
      parents.push(parent);
    }
  }

  // 7. Children (5 per group, each with 1-2 parents)
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
        },
      });
      children.push(child);
    }
  }

  // 8. CheckIns (simulate attendance, some late, some missing check-out)
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
          actorId: educator ? educator.id : superAdmin.id,
          type: 'IN',
          timestamp: new Date(day),
          method: 'QR',
        },
      });
      // 80% chance of check-out
      if (Math.random() < 0.8) {
        const outTime = new Date(day);
        outTime.setHours(day.getHours() + 8, day.getMinutes() + faker.number.int({ min: 0, max: 30 }));
        await prisma.checkInLog.create({
          data: {
            childId: child.id,
            actorId: educator ? educator.id : superAdmin.id,
            type: 'OUT',
            timestamp: outTime,
            method: 'QR',
          },
        });
      }
    }
  }

  // 9. Messages & Notifications
  for (const child of children) {
    await prisma.message.create({
      data: {
        content: `Info zu ${child.name}: ${faker.lorem.sentence()}`,
        childId: child.id,
        senderId: superAdmin.id,
      },
    });
    await prisma.notificationLog.create({
      data: {
        userId: superAdmin.id,
        title: faker.lorem.words(3),
        body: faker.lorem.sentence(),
      },
    });
  }

  // Print summary
  console.log('🎉 Mock-Datenbank erfolgreich erstellt:');
  console.log(`Institutionen: ${institutions.length}`);
  console.log(`Admins: ${admins.length}`);
  console.log(`Erzieher: ${educators.length}`);
  console.log(`Eltern: ${parents.length}`);
  console.log(`Gruppen: ${groups.length}`);
  console.log(`Kinder: ${children.length}`);

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
}

main().catch((e) => {
  console.error('❌ Fehler beim Hinzufügen der Testdaten:', e.message);
  prisma.$disconnect();
  process.exit(1);
});
