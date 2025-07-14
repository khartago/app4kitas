# 📚 API-Routenübersicht – App4KITAs Backend

## Authentifizierung
| Methode | Pfad           | Auth | Rollen         | Body/Params                                  |
|---------|----------------|------|---------------|----------------------------------------------|
| POST    | /api/register  | Ja   | SUPER_ADMIN    | { email, password, name, role, institutionId?, institutionName?, institutionAddress? } |
| POST    | /api/login     | Nein | Alle           | { email, password }                          |
| POST    | /api/logout    | Ja   | Alle           | –                                            |
| POST    | /api/refresh-token | Ja | Alle           | Authorization Header mit Token               |

## Benutzerprofil
| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/profile        | Ja   | Alle           | –                                            |
| PUT     | /api/profile        | Ja   | Alle           | { name?, email?, password?, avatarUrl? }     |
| POST    | /api/profile/avatar | Ja   | Alle           | Datei (avatar, multipart/form-data)          |

## Institutionen (Verwaltung)
| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/institutionen  | Ja   | SUPER_ADMIN    | –                                            |
| POST    | /api/institutionen  | Ja   | SUPER_ADMIN    | { name, address }                            |
| PUT     | /api/institutionen/:id | Ja | SUPER_ADMIN    | { name?, address? }                          |
| DELETE  | /api/institutionen/:id | Ja | SUPER_ADMIN    | –                                            |
| GET     | /api/institutionen/export | Ja | SUPER_ADMIN    | ?format=csv|pdf                              |

## Institutionseinstellungen
| Methode | Pfad                                    | Auth | Rollen         | Body/Params                                  |
|---------|-----------------------------------------|------|---------------|----------------------------------------------|
| GET     | /api/institution-settings/:institutionId | Ja   | ADMIN, SUPER_ADMIN | :institutionId (Institution-ID)              |
| PUT     | /api/institution-settings/:institutionId | Ja   | ADMIN, SUPER_ADMIN | { name, address?, openingTime?, closingTime? } |
| POST    | /api/institution-settings/:institutionId/closed-days | Ja | ADMIN, SUPER_ADMIN | { date?, fromDate?, toDate?, reason?, recurrence? } |
| DELETE  | /api/institution-settings/:institutionId/closed-days/:closedDayId | Ja | ADMIN, SUPER_ADMIN | :closedDayId (Geschlossener-Tag-ID) |
| GET     | /api/institution-settings/:institutionId/stats | Ja | ADMIN, SUPER_ADMIN | :institutionId (Institution-ID)              |

**Geschlossene Tage:**
- `date`: Einzelner Tag (Legacy)
- `fromDate` + `toDate`: Datumsbereich (z.B. Weihnachtsferien)
- `recurrence`: 'ONCE' (nur dieses Jahr) | 'YEARLY' (jedes Jahr)
- `repeatedClosedDays`: JSON mit Wochentagen (monday: true/false, etc.)

## Benutzerverwaltung
| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/users          | Ja   | SUPER_ADMIN, ADMIN | ?role=ADMIN/EDUCATOR/PARENT (optional)       |
| GET     | /api/users/:id      | Ja   | SUPER_ADMIN, ADMIN | :id (Benutzer-ID)                            |
| PUT     | /api/users/:id      | Ja   | SUPER_ADMIN, ADMIN | { name?, email?, password?, institutionId? } |
| DELETE  | /api/users/:id      | Ja   | SUPER_ADMIN    | :id (Benutzer-ID) - Nur für nicht-SUPER_ADMIN |
| GET     | /api/educators/export | Ja | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |
| GET     | /api/parents/export | Ja | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |

> **Hinweis:**
> Für ADMINs sind alle Listen- und Export-Endpunkte (z.B. /children, /groups, /users?role=EDUCATOR, /users?role=PARENT, Exporte) automatisch auf die eigene Institution beschränkt. ADMINs können nur Benutzer, Gruppen und Kinder der eigenen Institution sehen und verwalten.

## Kinder
| Methode | Pfad                        | Auth | Rollen                | Body/Params                                  |
|---------|-----------------------------|------|----------------------|----------------------------------------------|
| GET     | /api/children               | Ja   | Admin, Super Admin    | –                                            |
| GET     | /api/children/:id           | Ja   | Eltern, Erzieher, Admin, Super Admin | :id (Kind-ID)                    |
| POST    | /api/children               | Ja   | Admin, Super Admin    | { name, birthdate, groupId?, parentIds? }    |
| PUT     | /api/children/:id           | Ja   | Admin, Super Admin    | { name?, birthdate?, groupId?, parentIds? }  |
| DELETE  | /api/children/:id           | Ja   | Admin, Super Admin    | :id (Kind-ID)                                |
| PUT     | /api/children/:id/photo     | Ja   | Admin, Super Admin    | Datei (photo, multipart/form-data)           |
| GET     | /api/children/export        | Ja   | Admin, Super Admin    | ?format=csv|pdf                              |
| GET     | /api/children/:id/qrcode    | Ja   | Admin, Super Admin    | :id (Kind-ID) – Gibt QR-Code-Bild (PNG) zurück |
| POST    | /api/children/:id/qrcode/regenerate | Ja | Admin, Super Admin | :id (Kind-ID) – Generiert neuen QR-Code-Secret |

## Gruppen
| Methode | Pfad                | Auth | Rollen                | Body/Params                                  |
|---------|---------------------|------|----------------------|----------------------------------------------|
| GET     | /api/groups         | Ja   | Admin, Super Admin    | –                                            |
| GET     | /api/groups/:id     | Ja   | Erzieher, Eltern (Kind in Gruppe), Admin, Super Admin | :id (Gruppen-ID) |
| POST    | /api/groups         | Ja   | Admin, Super Admin    | { name, educatorIds? }                       |
| PUT     | /api/groups/:id     | Ja   | Admin, Super Admin    | { name?, educatorIds? }                      |
| DELETE  | /api/groups/:id     | Ja   | Admin, Super Admin    | :id (Gruppen-ID)                             |
| PUT     | /api/groups/:id/educators | Ja | Admin, Super Admin    | { educatorIds }                              |
| GET     | /api/groups/export  | Ja   | Admin, Super Admin    | ?format=csv|pdf                              |

## Erzieher-spezifische Endpunkte
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| GET     | /api/educators/:educatorId/group | Ja   | Erzieher selbst, Admin, Super Admin | :educatorId (Erzieher-ID)     |
| GET     | /api/educators/:educatorId/groups | Ja | Erzieher selbst, Admin, Super Admin | :educatorId (Erzieher-ID)   |
| GET     | /api/educators/:educatorId/children | Ja | Erzieher selbst, Admin, Super Admin | :educatorId (Erzieher-ID)   |
| GET     | /api/groups/:groupId/children   | Ja   | Erzieher in Gruppe, Admin, Super Admin | :groupId (Gruppen-ID)      |
| GET     | /api/groups/:groupId/children/today | Ja | Erzieher in Gruppe, Admin, Super Admin | :groupId (Gruppen-ID)    |
| GET     | /api/checkin/educator/:educatorId/stats | Ja | Erzieher selbst, Admin, Super Admin | :educatorId (Erzieher-ID) |
| GET     | /api/checkin/group/:groupId/today | Ja | Erzieher in Gruppe, Admin, Super Admin | :groupId (Gruppen-ID)    |

## Check-in/out
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/checkin                    | Ja   | Alle           | { childId, type (IN/OUT), method (QR/MANUAL) }|
| POST    | /api/checkin/qr                 | Ja   | Alle           | { qrCodeSecret, type (IN/OUT) }              |
| GET     | /api/checkin/child/:childId     | Ja   | Eltern, Erzieher, Admin, Super Admin | :childId (Kind-ID)           |
| GET     | /api/checkin/history/:childId   | Ja   | Eltern, Erzieher, Admin, Super Admin | :childId (Kind-ID)           |
| GET     | /api/checkin/stats              | Ja   | Admin, Super Admin | –                                           |
| GET     | /api/checkin/group/:groupId/today | Ja | Erzieher in Gruppe, Admin, Super Admin | :groupId (Gruppen-ID)    |
| GET     | /api/checkin/educator/:educatorId/stats | Ja | Erzieher selbst, Admin, Super Admin | :educatorId (Erzieher-ID) |

## Messaging
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/message                    | Ja   | Alle           | { content?, childId?, groupId? }, Datei (file, optional, PDF/Bild) |
| GET     | /api/messages/child/:childId    | Ja   | Eltern, Erzieher, Admin, Super Admin | :childId (Kind-ID)           |
| GET     | /api/messages/group/:groupId    | Ja   | Erzieher in Gruppe, Admin, Super Admin | :groupId (Gruppen-ID)       |

## Notizen
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/notes                      | Ja   | Erzieher, Admin, Super Admin | { childId, content }, Datei (file, optional) |
| GET     | /api/notes/child/:childId      | Ja   | Erzieher, Eltern, Admin, Super Admin | :childId (Kind-ID)           |
| PUT     | /api/notes/:noteId              | Ja   | Erzieher, Admin, Super Admin | { content }, Datei (file, optional)         |
| DELETE  | /api/notes/:noteId              | Ja   | Erzieher, Admin, Super Admin | :noteId (Notiz-ID)                          |

**Datei-Unterstützung:**
- Bilder (JPG, PNG, GIF, BMP, WebP, SVG)
- PDF-Dokumente
- Word-Dokumente (DOC, DOCX)
- Excel-Dateien (XLS, XLSX)
- PowerPoint-Dateien (PPT, PPTX)
- Textdateien
- Archivdateien (ZIP, RAR, TAR, GZ, 7Z)
- Videodateien (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- Audiodateien (MP3, WAV, FLAC, AAC, OGG)
- Code-Dateien (JS, TS, JSX, TSX, HTML, CSS, JSON, XML, PY, JAVA, CPP, C, PHP, RB, GO, RS)

## Benachrichtigungen
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/notifications/token        | Ja   | Alle           | { token }                                    |
| POST    | /api/notifications/send         | Ja   | ADMIN, SUPER_ADMIN | { recipientType, recipientId?, title, body, priority? } |
| GET     | /api/notifications/recipients   | Ja   | ADMIN, SUPER_ADMIN | –                                            |
| GET     | /api/notifications/admin        | Ja   | ADMIN, SUPER_ADMIN | ?page=1&limit=20&filter=all                 |
| GET     | /api/notifications/stats/:userId | Ja   | ADMIN, SUPER_ADMIN | :userId (Benutzer-ID)                        |
| GET     | /api/notifications/:userId      | Ja   | User selbst, Admin, Super Admin | :userId (Benutzer-ID)         |
| PATCH   | /api/notifications/:id          | Ja   | User selbst     | :id (Benachrichtigungs-ID)                   |
| PATCH   | /api/notifications/bulk-read    | Ja   | User selbst     | { notificationIds }                          |
| DELETE  | /api/notifications/:id          | Ja   | User selbst     | :id (Benachrichtigungs-ID)                   |

> **Hinweis:**
> ADMINs können Benachrichtigungen nur an Benutzer der eigenen Institution senden und nur Benachrichtigungen für Benutzer der eigenen Institution einsehen.

## Aktivitätsprotokoll
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| GET     | /api/activity/recent            | Ja   | Admin, Super Admin | –                                           |
| GET     | /api/activity/user/:userId      | Ja   | Admin, Super Admin | :userId (Benutzer-ID)                       |
| GET     | /api/activity/educator/:educatorId/recent | Ja | Erzieher selbst, Admin, Super Admin | :educatorId (Erzieher-ID) |

## Persönliche Aufgaben (Personal Tasks)
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| GET     | /api/personalTasks              | Ja   | Alle           | –                                            |
| POST    | /api/personalTasks              | Ja   | Alle           | { title, description?, priority? }           |
| PUT     | /api/personalTasks/:id          | Ja   | Alle           | { title?, description?, priority?, completed? } |
| DELETE  | /api/personalTasks/:id          | Ja   | Alle           | :id (Aufgaben-ID)                            |
| PATCH   | /api/personalTasks/:id/toggle   | Ja   | Alle           | :id (Aufgaben-ID)                            |

## DSGVO-Compliance (Data Subject Rights)

| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| GET     | /api/gdpr/data-export/:userId   | Ja   | User selbst, SUPER_ADMIN | :userId (Benutzer-ID)                    |
| GET     | /api/gdpr/data-portability/:userId | Ja | User selbst, SUPER_ADMIN | :userId (Benutzer-ID)                   |
| DELETE  | /api/gdpr/delete-account/:userId | Ja  | User selbst, SUPER_ADMIN | :userId (Benutzer-ID)                    |
| PATCH   | /api/gdpr/restrict/:userId      | Ja   | User selbst, SUPER_ADMIN | { reason?, duration? }                    |
| POST    | /api/gdpr/object/:userId        | Ja   | User selbst, SUPER_ADMIN | { reason, processingType }                |
| GET     | /api/gdpr/status/:userId        | Ja   | User selbst, SUPER_ADMIN | :userId (Benutzer-ID)                    |

**DSGVO-Funktionalitäten:**
- **Datenexport**: Vollständiger Export aller personenbezogenen Daten (Art. 15 DSGVO)
- **Datenportabilität**: Maschinenlesbares Format für Datenübertragung (Art. 20 DSGVO)
- **Kontolöschung**: Vollständige Datenlöschung mit Datei-Cleanup (Art. 17 DSGVO)
- **Datenbeschränkung**: Temporäre Einschränkung der Datenverarbeitung (Art. 18 DSGVO)
- **Widerspruch**: Verarbeitungstyp-spezifische Widersprüche (Art. 21 DSGVO)
- **Status-Abfrage**: DSGVO-Status und Aktivitäten eines Benutzers

## Datei-Uploads
- Profilbilder: POST /api/profile/avatar (Feld: avatar)
- Kinderfotos:  PUT /api/children/:id/photo (Feld: photo)
- Nachrichten:  POST /api/message (Feld: file)
- Notizen:      POST /api/notes (Feld: file)

**Alle Datei-Uploads werden im Verzeichnis `/uploads` gespeichert und als URL im jeweiligen Datenbankfeld abgelegt.**

## Statistiken
| Methode | Pfad        | Auth | Rollen         | Body/Params |
|---------|-------------|------|---------------|-------------|
| GET     | /api/stats  | Ja   | ADMIN, SUPER_ADMIN | –           |

**Erweiterte Antwort mit Dashboard-Daten:**
```json
{
  "users": 100,
  "admins": 10,
  "educators": 30,
  "parents": 50,
  "children": 200,
  "groups": 8,
  "checkins": 1200,
  "messages": 300,
  "notifications": 500,
  "attendanceToday": {
    "checkedIn": 45,
    "absent": 5,
    "late": 2
  },
  "recentActivities": [
    {
      "type": "checkin",
      "text": "Max Mustermann eingecheckt (08:01)",
      "timestamp": "2024-01-15T08:01:00Z"
    },
    {
      "type": "message", 
      "text": "Neue Nachricht von Eltern von Anna: \"Krankmeldung für morgen...\"",
      "timestamp": "2024-01-15T07:30:00Z"
    }
  ],
  "openTasks": [
    "2 Kinder noch nicht ausgecheckt",
    "1 Abwesenheit unentschuldigt"
  ]
}
```

## Berichte & Export
| Methode | Pfad                        | Auth | Rollen         | Body/Params                                  |
|---------|-----------------------------|------|---------------|----------------------------------------------|
| GET     | /api/reports/daily          | Ja   | ADMIN, SUPER_ADMIN | ?date=YYYY-MM-DD, ?groupId (optional)    |
| GET     | /api/reports/monthly        | Ja   | ADMIN, SUPER_ADMIN | ?month=YYYY-MM, ?groupId (optional)      |
| GET     | /api/reports/late-pickups   | Ja   | ADMIN, SUPER_ADMIN | ?date=YYYY-MM-DD, ?groupId (optional)    |
| GET     | /api/reports/daily/export   | Ja   | ADMIN, SUPER_ADMIN | ?date=YYYY-MM-DD, format=csv/pdf         |
| GET     | /api/reports/monthly/export | Ja   | ADMIN, SUPER_ADMIN | ?month=YYYY-MM, format=csv/pdf           |
| GET     | /api/reports/late-pickups/export | Ja | ADMIN, SUPER_ADMIN | ?date=YYYY-MM-DD, format=csv/pdf         |
| GET     | /api/reports/user-growth    | Ja   | SUPER_ADMIN    | ?from=YYYY-MM-DD&to=YYYY-MM-DD           |
| GET     | /api/reports/active-users   | Ja   | SUPER_ADMIN    | ?days=7 (default: 7)                     |
| GET     | /api/reports/checkin-trends | Ja   | SUPER_ADMIN    | ?from=YYYY-MM-DD&to=YYYY-MM-DD           |
| GET     | /api/reports/active-groups  | Ja   | SUPER_ADMIN    | ?from=YYYY-MM-DD&to=YYYY-MM-DD           |
| GET     | /api/reports/message-volume | Ja   | SUPER_ADMIN    | ?from=YYYY-MM-DD&to=YYYY-MM-DD           |
| GET     | /api/reports/notification-stats | Ja | SUPER_ADMIN    | ?from=YYYY-MM-DD&to=YYYY-MM-DD           |
| GET     | /api/reports/failed-logins  | Ja   | SUPER_ADMIN    | ?from=YYYY-MM-DD&to=YYYY-MM-DD           |
| GET     | /api/reports/children-without-checkin | Ja   | ADMIN, SUPER_ADMIN | ?days=7 (optional), ?format=csv |
| GET     | /api/reports/group-attendance         | Ja   | ADMIN, SUPER_ADMIN | ?from=YYYY-MM-DD&to=YYYY-MM-DD, ?format=csv |
| GET     | /api/reports/active-educators         | Ja   | ADMIN, SUPER_ADMIN | ?from=YYYY-MM-DD&to=YYYY-MM-DD, ?format=csv |
| GET     | /api/reports/checkin-methods          | Ja   | ADMIN, SUPER_ADMIN | ?from=YYYY-MM-DD&to=YYYY-MM-DD, ?format=csv |
| GET     | /api/reports/platform-stats           | Ja   | SUPER_ADMIN    | –                                           |
| GET     | /api/reports/messages         | Ja   | ADMIN, SUPER_ADMIN | ?startDate, ?endDate, ?groupId, ?type |
| GET     | /api/reports/messages/export  | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf, ?startDate, ?endDate, ?groupId, ?type |
| GET     | /api/reports/notifications    | Ja   | ADMIN, SUPER_ADMIN | ?startDate, ?endDate, ?type, ?priority |
| GET     | /api/reports/notifications/export | Ja | ADMIN, SUPER_ADMIN | ?format=csv|pdf, ?startDate, ?endDate, ?type, ?priority |
| GET     | /api/reports/users            | Ja   | ADMIN, SUPER_ADMIN | ?role, ?institutionId |
| GET     | /api/reports/users/export     | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf, ?role, ?institutionId |
| GET     | /api/reports/statistics       | Ja   | ADMIN, SUPER_ADMIN | ?startDate, ?endDate, ?institutionId |
| GET     | /api/reports/statistics/export| Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf, ?startDate, ?endDate, ?institutionId |
| GET     | /api/reports/attendance       | Ja   | ADMIN, SUPER_ADMIN | ?startDate, ?endDate, ?groupId |
| GET     | /api/reports/attendance/export| Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf, ?startDate, ?endDate, ?groupId |
| GET     | /api/reports/check-in         | Ja   | ADMIN, SUPER_ADMIN | ?startDate, ?endDate, ?childId |
| GET     | /api/reports/check-in/export  | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf, ?startDate, ?endDate, ?childId |

## Export-Funktionen (Verbessert)
| Methode | Pfad                        | Auth | Rollen         | Body/Params                                  |
|---------|-----------------------------|------|---------------|----------------------------------------------|
| GET     | /api/groups/export          | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |
| GET     | /api/children/export        | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |
| GET     | /api/educators/export       | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |

## Antwortformate

### Erzieher-Gruppe
```json
{
  "id": "group-uuid",
  "name": "Gruppe A",
  "institutionId": "institution-uuid",
  "children": [
    {
      "id": "child-uuid",
      "name": "Max Mustermann",
      "birthdate": "2020-01-15",
      "parents": [
        {
          "id": "parent-uuid",
          "name": "Eltern Mustermann",
          "email": "eltern@example.com"
        }
      ]
    }
  ],
  "educators": [
    {
      "id": "educator-uuid",
      "name": "Erzieher Name",
      "email": "erzieher@example.com"
    }
  ]
}
```

### Erzieher-Kinder
```json
{
  "children": [
    {
      "id": "child-uuid",
      "name": "Max Mustermann",
      "birthdate": "2020-01-15",
      "parents": [
        {
          "id": "parent-uuid",
          "name": "Eltern Mustermann",
          "email": "eltern@example.com"
        }
      ]
    }
  ]
}
```

### Aktivitäten
```json
{
  "activities": [
    {
      "id": "activity-uuid",
      "action": "CHECKIN",
      "description": "Max Mustermann eingecheckt",
      "createdAt": "2024-01-15T08:00:00Z",
      "child": {
        "id": "child-uuid",
        "name": "Max Mustermann"
      },
      "user": {
        "id": "user-uuid",
        "name": "Erzieher Name"
      }
    }
  ]
}
```

### Nachrichten
```json
[
  {
    "id": "message-uuid",
    "content": "Nachrichtentext",
    "createdAt": "2024-01-15T10:00:00Z",
    "senderId": "sender-uuid",
    "childId": "child-uuid",
    "groupId": null,
    "fileUrl": "/uploads/file.pdf",
    "fileType": "PDF"
  }
]
```

### Notizen
```json
[
  {
    "id": "note-uuid",
    "content": "Notizentext",
    "createdAt": "2024-01-15T10:00:00Z",
    "childId": "child-uuid",
    "fileUrl": "/uploads/note.pdf",
    "fileType": "PDF"
  }
]
```

---

## 📋 Vollständige API-Übersicht

### 🔐 Authentifizierung & Profil
- `POST /api/register` - Benutzer registrieren (SUPER_ADMIN)
- `POST /api/login` - Anmelden
- `POST /api/logout` - Abmelden
- `POST /api/refresh-token` - Token erneuern
- `GET /api/profile` - Profil abrufen
- `PUT /api/profile` - Profil aktualisieren
- `POST /api/profile/avatar` - Avatar hochladen

### 🏢 Institutionen & Einstellungen
- `GET /api/institutionen` - Institutionen auflisten (SUPER_ADMIN)
- `POST /api/institutionen` - Institution erstellen (SUPER_ADMIN)
- `PUT /api/institutionen/:id` - Institution bearbeiten (SUPER_ADMIN)
- `DELETE /api/institutionen/:id` - Institution löschen (SUPER_ADMIN)
- `GET /api/institutionen/export` - Institutionen exportieren (SUPER_ADMIN)
- `GET /api/institution-settings/:institutionId` - Einstellungen abrufen
- `PUT /api/institution-settings/:institutionId` - Einstellungen aktualisieren
- `POST /api/institution-settings/:institutionId/closed-days` - Geschlossenen Tag hinzufügen
- `DELETE /api/institution-settings/:institutionId/closed-days/:closedDayId` - Geschlossenen Tag entfernen
- `GET /api/institution-settings/:institutionId/stats` - Institution Statistiken

### 👥 Benutzerverwaltung
- `GET /api/users` - Benutzer auflisten
- `GET /api/users/:id` - Benutzer abrufen
- `PUT /api/users/:id` - Benutzer bearbeiten
- `DELETE /api/users/:id` - Benutzer löschen (SUPER_ADMIN)
- `GET /api/educators/export` - Erzieher exportieren
- `GET /api/parents/export` - Eltern exportieren

### 👶 Kinderverwaltung
- `GET /api/children` - Kinder auflisten
- `GET /api/children/:id` - Kind abrufen
- `POST /api/children` - Kind erstellen
- `PUT /api/children/:id` - Kind bearbeiten
- `DELETE /api/children/:id` - Kind löschen
- `PUT /api/children/:id/photo` - Kinderfoto hochladen
- `GET /api/children/export` - Kinder exportieren
- `GET /api/children/:id/qrcode` - QR-Code abrufen
- `POST /api/children/:id/qrcode/regenerate` - QR-Code neu generieren

### 👥 Gruppenverwaltung
- `GET /api/groups` - Gruppen auflisten
- `GET /api/groups/:id` - Gruppe abrufen
- `POST /api/groups` - Gruppe erstellen
- `PUT /api/groups/:id` - Gruppe bearbeiten
- `DELETE /api/groups/:id` - Gruppe löschen
- `PUT /api/groups/:id/educators` - Erzieher zuweisen
- `GET /api/groups/export` - Gruppen exportieren

### ✅ Check-in/out
- `POST /api/checkin` - Check-in/out durchführen
- `POST /api/checkin/qr` - Check-in/out per QR-Code
- `GET /api/checkin/child/:childId` - Kind Check-in Historie
- `GET /api/checkin/history/:childId` - Check-in Historie
- `GET /api/checkin/stats` - Check-in Statistiken

### 💬 Messaging & Chat
- `POST /api/message` - Nachricht senden
- `GET /api/messages/child/:childId` - Nachrichten für Kind
- `GET /api/messages/group/:groupId` - Gruppen-Nachrichten
- `POST /api/message` - Nachricht mit Anhang senden
- `GET /api/messages` - Alle Nachrichten (mit Filterung)
- `PUT /api/messages/:messageId` - Nachricht bearbeiten
- `DELETE /api/messages/:messageId` - Nachricht löschen
- `POST /api/messages/:messageId/reactions` - Reaktion hinzufügen
- `DELETE /api/messages/:messageId/reactions` - Reaktion entfernen

### 📢 Benachrichtigungen
- `POST /api/notifications/token` - Device Token registrieren
- `POST /api/notifications/send` - Benachrichtigung senden
- `GET /api/notifications/recipients` - Empfänger abrufen
- `GET /api/notifications/admin` - Admin Benachrichtigungen
- `GET /api/notifications/stats/:userId` - Benachrichtigungsstatistiken
- `GET /api/notifications/:userId` - Benutzer Benachrichtigungen
- `PATCH /api/notifications/:id` - Als gelesen markieren
- `PATCH /api/notifications/bulk-read` - Mehrere als gelesen markieren
- `DELETE /api/notifications/:id` - Benachrichtigung löschen

### 📊 Statistiken & Aktivitäten
- `GET /api/stats` - Dashboard Statistiken
- `GET /api/activity/recent` - Letzte Aktivitäten
- `GET /api/activity/user/:userId` - Benutzer Aktivitäten

### ✅ Persönliche Aufgaben
- `GET /api/personalTasks` - Aufgaben auflisten
- `POST /api/personalTasks` - Aufgabe erstellen
- `PUT /api/personalTasks/:id` - Aufgabe bearbeiten
- `DELETE /api/personalTasks/:id` - Aufgabe löschen
- `PATCH /api/personalTasks/:id/toggle` - Aufgabe umschalten

### 📈 Berichte & Export
- `GET /api/reports/daily` - Tagesbericht
- `GET /api/reports/monthly` - Monatsbericht
- `GET /api/reports/late-pickups` - Verspätete Abholungen
- `GET /api/reports/daily/export` - Tagesbericht exportieren
- `GET /api/reports/monthly/export` - Monatsbericht exportieren
- `GET /api/reports/late-pickups/export` - Verspätete Abholungen exportieren
- `GET /api/reports/user-growth` - Benutzerwachstum (SUPER_ADMIN)
- `GET /api/reports/active-users` - Aktive Benutzer (SUPER_ADMIN)
- `GET /api/reports/checkin-trends` - Check-in Trends (SUPER_ADMIN)
- `GET /api/reports/active-groups` - Aktive Gruppen (SUPER_ADMIN)
- `GET /api/reports/message-volume` - Nachrichtenaufkommen (SUPER_ADMIN)
- `GET /api/reports/notification-stats` - Benachrichtigungsstatistiken (SUPER_ADMIN)
- `GET /api/reports/failed-logins` - Fehlgeschlagene Anmeldungen (SUPER_ADMIN)
- `GET /api/reports/children-without-checkin` - Kinder ohne Check-in
- `GET /api/reports/group-attendance` - Gruppenanwesenheit
- `GET /api/reports/active-educators` - Aktive Erzieher
- `GET /api/reports/checkin-methods` - Check-in Methoden
- `GET /api/reports/platform-stats` - Plattformstatistiken (SUPER_ADMIN)
- `GET /api/reports/messages` - Nachrichtenbericht (ADMIN, SUPER_ADMIN)
- `GET /api/reports/messages/export` - Nachrichtenbericht exportieren (ADMIN, SUPER_ADMIN)
- `GET /api/reports/notifications` - Benachrichtigungsbericht (ADMIN, SUPER_ADMIN)
- `GET /api/reports/notifications/export` - Benachrichtigungsbericht exportieren (ADMIN, SUPER_ADMIN)
- `GET /api/reports/users` - Benutzerbericht (ADMIN, SUPER_ADMIN)
- `GET /api/reports/users/export` - Benutzerbericht exportieren (ADMIN, SUPER_ADMIN)
- `GET /api/reports/statistics` - Statistikenbericht (ADMIN, SUPER_ADMIN)
- `GET /api/reports/statistics/export` - Statistikenbericht exportieren (ADMIN, SUPER_ADMIN)
- `GET /api/reports/attendance` - Anwesenheitsbericht (ADMIN, SUPER_ADMIN)
- `GET /api/reports/attendance/export` - Anwesenheitsbericht exportieren (ADMIN, SUPER_ADMIN)
- `GET /api/reports/check-in` - Check-in Bericht (ADMIN, SUPER_ADMIN)
- `GET /api/reports/check-in/export` - Check-in Bericht exportieren (ADMIN, SUPER_ADMIN)

### 📁 Datei-Uploads
- `POST /api/profile/avatar` - Profilbild hochladen
- `PUT /api/children/:id/photo` - Kinderfoto hochladen
- `POST /api/message` - Nachrichtenanhänge hochladen
- `POST /api/notes` - Notizenanhänge hochladen

**Alle Endpunkte verwenden JWT-Authentifizierung und sind rollenbasiert geschützt.**
- Seitennummerierung
- Deutsche Datumsformate
- Professionelle Typografie

## Rollen & Berechtigungen

### SUPER_ADMIN
- Vollzugriff auf alle Endpunkte
- Kann Institutionen verwalten
- Kann alle Benutzer verwalten
- Kann alle Statistiken und Berichte abrufen

### ADMIN
- Kann Kinder, Gruppen und Personal verwalten
- Kann Statistiken und Berichte abrufen
- Kann Benutzer in der eigenen Institution verwalten
- Kann Check-ins und Nachrichten verwalten

### EDUCATOR
- Kann Kinder in der eigenen Gruppe verwalten
- Kann Check-ins für Kinder in der eigenen Gruppe durchführen
- Kann Nachrichten senden und empfangen
- Kann Berichte für die eigene Gruppe abrufen

### PARENT
- Kann eigene Kinder verwalten
- Kann Check-ins für eigene Kinder einsehen
- Kann Nachrichten senden und empfangen
- Kann Berichte für eigene Kinder abrufen

> **Hinweis:**
> Für ADMINs sind alle Berichte und Exporte institution-spezifisch. Es werden nur Daten der eigenen Institution angezeigt und exportiert.

> **Frontend-Hinweis:**
> Im Admin-Dashboard werden alle Listen (Kinder, Gruppen, Erzieher, Eltern) und die Empfängerauswahl für Benachrichtigungen zusätzlich im Frontend nach Institution gefiltert. So wird maximale Sicherheit gewährleistet, auch falls der Backend-Filter fehlschlägt. 