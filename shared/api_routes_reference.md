# 📚 API-Routenübersicht – App4KITAs Backend

## Authentifizierung
| Methode | Pfad           | Auth | Rollen         | Body/Params                                  |
|---------|----------------|------|---------------|----------------------------------------------|
| POST    | /api/register  | Ja   | SUPER_ADMIN    | { email, password, name, role, institutionId?, institutionName?, institutionAddress? } |
| POST    | /api/login     | Nein | Alle           | { email, password }                          |

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

## Benutzerverwaltung
| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/users          | Ja   | SUPER_ADMIN, ADMIN | ?role=ADMIN/EDUCATOR/PARENT (optional)       |
| GET     | /api/users/:id      | Ja   | SUPER_ADMIN, ADMIN | :id (Benutzer-ID)                            |
| PUT     | /api/users/:id      | Ja   | SUPER_ADMIN, ADMIN | { name?, email?, password?, institutionId? } |
| DELETE  | /api/users/:id      | Ja   | SUPER_ADMIN    | :id (Benutzer-ID) - Nur für nicht-SUPER_ADMIN |

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

## Check-in/out
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/checkin                    | Ja   | Alle           | { childId, type (IN/OUT), method (QR/MANUAL) }|
| POST    | /api/checkin/qr                 | Ja   | Alle           | { qrCodeSecret, type (IN/OUT) }              |
| GET     | /api/checkin/child/:childId     | Ja   | Eltern, Erzieher, Admin, Super Admin | :childId (Kind-ID)           |
| GET     | /api/checkin/history/:childId   | Ja   | Eltern, Erzieher, Admin, Super Admin | :childId (Kind-ID)           |
| GET     | /api/checkin/stats              | Ja   | Admin, Super Admin | –                                           |

## Messaging
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/message                    | Ja   | Alle           | { content?, childId?, groupId? }, Datei (file, optional, PDF/Bild) |
| GET     | /api/messages/child/:childId    | Ja   | Eltern, Erzieher, Admin, Super Admin | :childId (Kind-ID)           |

## Benachrichtigungen
| Methode | Pfad                            | Auth | Rollen         | Body/Params                                  |
|---------|---------------------------------|------|---------------|----------------------------------------------|
| POST    | /api/notifications/token        | Ja   | Alle           | { token }                                    |
| POST    | /api/notifications/send         | Ja   | Alle           | { userId, title, body }                      |
| GET     | /api/notifications/:userId      | Ja   | User selbst, Admin, Super Admin | :userId (Benutzer-ID)         |
| PATCH   | /api/notifications/:id          | Ja   | User selbst     | :id (Benachrichtigungs-ID)                   |

> **Hinweis:**
> ADMINs können Benachrichtigungen nur an Benutzer der eigenen Institution senden und nur Benachrichtigungen für Benutzer der eigenen Institution einsehen.

## Datei-Uploads
- Profilbilder: POST /api/profile/avatar (Feld: avatar)
- Kinderfotos:  PUT /api/children/:id/photo (Feld: photo)
- Nachrichten:  POST /api/message (Feld: file)

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

## Export-Funktionen (Verbessert)
| Methode | Pfad                        | Auth | Rollen         | Body/Params                                  |
|---------|-----------------------------|------|---------------|----------------------------------------------|
| GET     | /api/groups/export          | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |
| GET     | /api/children/export        | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |
| GET     | /api/educators/export       | Ja   | ADMIN, SUPER_ADMIN | ?format=csv|pdf                              |

### Export-Features:
- **CSV Export**: Semikolon-getrennt, UTF-8 mit BOM für Excel-Kompatibilität
- **PDF Export**: Professionell gestaltete Tabellen mit App4KITAs Branding
- **Dynamische Dateinamen**: Mit Datum für bessere Organisation
- **Sortierung**: Alphabetisch nach Namen
- **Deutsche Lokalisierung**: Alle Texte und Datumsformate in Deutsch

### CSV Format:
- Delimiter: Semikolon (;)
- Encoding: UTF-8 mit BOM
- Quote: Doppelte Anführungszeichen
- Headers: Deutsche Spaltennamen

### PDF Format:
- A4 Größe mit 50px Margins
- App4KITAs Header mit Logo
- Farbkodierte Tabellen (verschiedene Farben pro Export-Typ)
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