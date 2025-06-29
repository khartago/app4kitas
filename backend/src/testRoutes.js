require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.SUPERADMIN_EMAIL;
const PASSWORD = process.env.SUPERADMIN_PASSWORD;

async function main() {
  try {
    // Login
    const loginRes = await axios.post(`${BASE_URL}/api/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    const token = loginRes.data.token;
    if (!token) {
      console.error('❌ Login fehlgeschlagen: Kein Token erhalten');
      process.exit(1);
    }
    console.log('✅ Login erfolgreich, Token erhalten.');

    // Get Super Admin profile (for userId)
    let userId;
    let childId;
    let groupId;
    try {
      const res = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      userId = res.data.id;
      if (!userId) throw new Error('Keine Benutzer-ID im Profil gefunden');
      console.log(`✅ Benutzer-ID gefunden: ${userId}`);
    } catch (err) {
      console.error('❌ Fehler beim Abrufen des Profils:', err.response?.data || err.message);
      return;
    }

    // Get all children
    let children = [];
    try {
      const res = await axios.get(`${BASE_URL}/api/children`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      children = res.data;
      if (Array.isArray(children) && children.length > 0) {
        childId = children[0].id;
        console.log(`✅ Kinder gefunden: ${children.length}, Beispiel-ID: ${childId}`);
      } else {
        console.warn('⚠️  Keine Kinder gefunden.');
      }
    } catch (err) {
      console.warn('⚠️  Fehler beim Abrufen der Kinder:', err.response?.data || err.message);
    }

    // Get all groups
    let groups = [];
    try {
      const res = await axios.get(`${BASE_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      groups = res.data;
      if (Array.isArray(groups) && groups.length > 0) {
        groupId = groups[0].id;
        console.log(`✅ Gruppen gefunden: ${groups.length}, Beispiel-ID: ${groupId}`);
      } else {
        console.warn('⚠️  Keine Gruppen gefunden.');
      }
    } catch (err) {
      console.warn('⚠️  Fehler beim Abrufen der Gruppen:', err.response?.data || err.message);
    }

    // Helper for requests
    async function testRequest({ method, path, name, data, headers }) {
      try {
        const opts = {
          method,
          url: `${BASE_URL}${path}`,
          headers: { Authorization: `Bearer ${token}` , ...(headers || {}) },
          data,
        };
        const res = await axios(opts);
        if (res.status >= 200 && res.status < 300) {
          console.log(`✅ [${method}] ${name} (${path}): Erfolgreich`);
        } else {
          console.error(`❌ [${method}] ${name} (${path}): Fehler (Status ${res.status})`);
        }
      } catch (err) {
        if (err.response) {
          console.error(`❌ [${method}] ${name} (${path}): Fehler (Status ${err.response.status})`);
        } else {
          console.error(`❌ [${method}] ${name} (${path}): Netzwerk- oder Verbindungsfehler`);
        }
      }
    }

    // Test all endpoints
    const tests = [
      // Auth (login already tested)
      { method: 'GET', path: '/api/profile', name: 'Profil abrufen' },
      { method: 'PUT', path: '/api/profile', name: 'Profil aktualisieren', data: { name: 'Super Admin Test' } },
      // Kinder
      { method: 'GET', path: '/api/children', name: 'Alle Kinder abrufen' },
      childId && { method: 'GET', path: `/api/children/${childId}`, name: 'Kind abrufen' },
      { method: 'POST', path: '/api/children', name: 'Kind anlegen', data: { name: 'Testkind2', birthdate: '2019-01-01' } },
      // Gruppen
      { method: 'GET', path: '/api/groups', name: 'Alle Gruppen abrufen' },
      groupId && { method: 'GET', path: `/api/groups/${groupId}`, name: 'Gruppe abrufen' },
      { method: 'POST', path: '/api/groups', name: 'Gruppe anlegen', data: { name: 'Testgruppe2' } },
      // Benachrichtigungen
      userId && { method: 'GET', path: `/api/notifications/${userId}`, name: 'Benachrichtigungen abrufen' },
      userId && { method: 'POST', path: '/api/notifications/send', name: 'Benachrichtigung senden', data: { userId, title: 'Test', body: 'Testbody' } },
      // Messaging
      childId && { method: 'GET', path: `/api/messages/child/${childId}`, name: 'Nachrichten für Kind abrufen' },
      // Checkin/Checkout, Datei-Uploads, etc. can be added as needed
    ].filter(Boolean);

    for (const test of tests) {
      await testRequest(test);
    }

    // Hinweis zu Datei-Uploads
    console.log('ℹ️  Datei-Uploads (Profilbild, Kinderfoto, Nachricht mit Datei) werden in diesem Test nicht automatisch getestet.');
  } catch (err) {
    console.error('❌ Login fehlgeschlagen:', err.response?.data || err.message);
    process.exit(1);
  }
}

main();
