# 📊 App4KITAs API Routes Reference

**Last Updated: July 2025**

## 🔐 Authentifizierung

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| POST    | /api/auth/register  | Ja   | SUPER_ADMIN   | { email, password, name, role, institutionId? } |
| POST    | /api/auth/login     | Nein | Alle          | { email, password }                          |
| POST    | /api/auth/logout    | Ja   | Alle          | -                                            |
| GET     | /api/auth/profile   | Ja   | Alle          | -                                            |

## 🏢 Institutionen

| Methode | Pfad                                    | Auth | Rollen         | Body/Params                                  |
|---------|-----------------------------------------|------|---------------|----------------------------------------------|
| GET     | /api/institutionen                     | Ja   | SUPER_ADMIN   | ?page=1&limit=10&search=term                |
| POST    | /api/institutionen                     | Ja   | SUPER_ADMIN   | { name, address? }                           |
| GET     | /api/institutionen/:id                 | Ja   | SUPER_ADMIN    | :id (Institution-ID)                         |
| PUT     | /api/institutionen/:id                 | Ja   | SUPER_ADMIN    | { name?, address? }                          |
| DELETE  | /api/institutionen/:id                 | Ja   | SUPER_ADMIN    | :id (Institution-ID)                         |
| GET     | /api/institutionen/export              | Ja   | SUPER_ADMIN    | ?format=csv\|pdf                              |

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

## 👥 Benutzerverwaltung

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/users          | Ja   | SUPER_ADMIN, ADMIN | ?role=ADMIN/EDUCATOR/PARENT (optional)       |
| GET     | /api/users/:id      | Ja   | SUPER_ADMIN, ADMIN | :id (Benutzer-ID)                            |
| PUT     | /api/users/:id      | Ja   | SUPER_ADMIN, ADMIN | { name?, email?, password?, institutionId? } |
| DELETE  | /api/users/:id      | Ja   | SUPER_ADMIN    | :id (Benutzer-ID) - Nur für nicht-SUPER_ADMIN |

## 👶 Kinder

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/children       | Ja   | ADMIN, EDUCATOR | ?page=1&limit=10&search=term&groupId=id     |
| POST    | /api/children       | Ja   | ADMIN          | { name, birthDate, groupId?, parentIds? }   |
| GET     | /api/children/:id   | Ja   | ADMIN, EDUCATOR | :id (Kind-ID)                                |
| PUT     | /api/children/:id   | Ja   | ADMIN          | { name?, birthDate?, groupId?, parentIds? } |
| DELETE  | /api/children/:id   | Ja   | ADMIN          | :id (Kind-ID)                                |
| PUT     | /api/children/:id/photo | Ja | ADMIN          | multipart/form-data (Foto)                   |
| GET     | /api/children/export | Ja  | ADMIN          | ?format=csv\|pdf                              |

## 👥 Gruppen

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/groups         | Ja   | ADMIN, EDUCATOR | ?page=1&limit=10&search=term                 |
| POST    | /api/groups         | Ja   | ADMIN          | { name, educatorIds? }                       |
| GET     | /api/groups/:id     | Ja   | ADMIN, EDUCATOR | :id (Gruppen-ID)                             |
| PUT     | /api/groups/:id     | Ja   | ADMIN          | { name?, educatorIds? }                      |
| DELETE  | /api/groups/:id     | Ja   | ADMIN          | :id (Gruppen-ID)                             |
| GET     | /api/groups/export  | Ja   | ADMIN          | ?format=csv\|pdf                              |

## ✅ Check-in/out

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| POST    | /api/checkin        | Ja   | EDUCATOR       | { childId, type: 'IN'\|'OUT', method: 'QR'\|'MANUAL' } |
| GET     | /api/checkin/:childId | Ja  | Alle          | :childId (Kind-ID)                           |
| PUT     | /api/checkin/:id    | Ja   | EDUCATOR       | { checkInTime?, checkOutTime? }              |
| GET     | /api/checkin/group/:groupId | Ja | EDUCATOR | :groupId (Gruppen-ID)                        |

## 💬 Nachrichten

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/messages       | Ja   | Alle          | ?channelId=id&page=1&limit=20               |
| POST    | /api/messages       | Ja   | Alle          | { content, channelId, file? }                |
| DELETE  | /api/messages/:id   | Ja   | Sender         | :id (Nachrichten-ID)                         |
| POST    | /api/messages/:id/reactions | Ja | Alle      | { emoji }                                    |
| DELETE  | /api/messages/:id/reactions/:emoji | Ja | Alle | :emoji                                       |

## 📝 Notizen

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/notes          | Ja   | EDUCATOR, ADMIN | ?childId=id&page=1&limit=20                 |
| POST    | /api/notes          | Ja   | EDUCATOR, ADMIN | { content, childId, file? }                  |
| PUT     | /api/notes/:id      | Ja   | Author         | { content? }                                 |
| DELETE  | /api/notes/:id      | Ja   | Author         | :id (Notizen-ID)                             |

## 📊 Berichte

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/reports/daily  | Ja   | ADMIN          | ?date=YYYY-MM-DD&groupId=id                  |
| GET     | /api/reports/monthly | Ja  | ADMIN          | ?month=YYYY-MM&groupId=id                    |
| GET     | /api/reports/attendance | Ja | ADMIN          | ?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&groupId=id |
| GET     | /api/reports/check-in | Ja | ADMIN          | ?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&groupId=id |
| GET     | /api/reports/export | Ja   | ADMIN          | ?type=daily\|monthly\|attendance\|check-in&format=csv\|pdf |

## 📈 Statistiken

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/stats          | Ja   | ADMIN, SUPER_ADMIN | ?institutionId=id&period=day\|week\|month   |
| GET     | /api/stats/children | Ja   | ADMIN          | ?institutionId=id                            |
| GET     | /api/stats/checkins | Ja   | ADMIN          | ?institutionId=id&period=day\|week\|month   |
| GET     | /api/stats/messages | Ja   | ADMIN          | ?institutionId=id&period=day\|week\|month   |

## 🔔 Benachrichtigungen

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/notifications  | Ja   | Alle          | ?page=1&limit=20                             |
| POST    | /api/notifications  | Ja   | ADMIN          | { title, message, recipients: 'ALL'\|'GROUP'\|'INDIVIDUAL', groupId?, userIds? } |
| PUT     | /api/notifications/:id/read | Ja | Alle      | :id (Benachrichtigungs-ID)                   |
| DELETE  | /api/notifications/:id | Ja  | Sender         | :id (Benachrichtigungs-ID)                   |

## 🔐 GDPR Compliance

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/gdpr/data-export/:userId | Ja | Betroffener | :userId (Benutzer-ID)                        |
| DELETE  | /api/gdpr/delete-account/:userId | Ja | Betroffener | :userId (Benutzer-ID)                        |
| PATCH   | /api/gdpr/restrict/:userId | Ja | Betroffener | :userId (Benutzer-ID)                        |
| POST    | /api/gdpr/object/:userId | Ja | Betroffener | :userId (Benutzer-ID)                        |
| GET     | /api/gdpr/status/:userId | Ja | Betroffener | :userId (Benutzer-ID)                        |
| GET     | /api/gdpr/compliance-report | Ja | SUPER_ADMIN | ?institutionId=id&period=day\|week\|month   |
| GET     | /api/gdpr/backup-verification | Ja | SUPER_ADMIN | ?institutionId=id                            |
| GET     | /api/gdpr/anomaly-detection | Ja | SUPER_ADMIN | ?institutionId=id&period=day\|week\|month   |
| GET     | /api/gdpr/privacy-by-design | Ja | SUPER_ADMIN | ?institutionId=id                            |
| GET     | /api/gdpr/real-time-monitoring | Ja | SUPER_ADMIN | ?institutionId=id                            |
| GET     | /api/gdpr/compliance-scoring | Ja | SUPER_ADMIN | ?institutionId=id                            |
| GET     | /api/gdpr/recommendations | Ja | SUPER_ADMIN | ?institutionId=id                            |

## 📁 Datei-Uploads

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| POST    | /api/profile/avatar | Ja   | Alle          | multipart/form-data (Avatar)                 |
| PUT     | /api/children/:id/photo | Ja | ADMIN          | multipart/form-data (Kinderfoto)             |
| POST    | /api/messages       | Ja   | Alle          | multipart/form-data (Nachrichtenanhänge)     |
| POST    | /api/notes          | Ja   | EDUCATOR, ADMIN | multipart/form-data (Notizenanhänge)         |

## 📋 Persönliche Aufgaben

| Methode | Pfad                | Auth | Rollen         | Body/Params                                  |
|---------|---------------------|------|---------------|----------------------------------------------|
| GET     | /api/personal-tasks | Ja   | Alle          | ?status=all\|open\|completed                 |
| POST    | /api/personal-tasks | Ja   | Alle          | { title, description?, priority: 'HIGH'\|'MEDIUM'\|'LOW' } |
| PUT     | /api/personal-tasks/:id | Ja | Alle      | { title?, description?, priority?, completed? } |
| DELETE  | /api/personal-tasks/:id | Ja | Alle      | :id (Aufgaben-ID)                            |

## 🔍 Suche & Filter

### Unterstützte Filter
- **Paginierung**: `?page=1&limit=10`
- **Suche**: `?search=term` (Name, E-Mail, etc.)
- **Rollenfilter**: `?role=ADMIN/EDUCATOR/PARENT`
- **Gruppenfilter**: `?groupId=id`
- **Institutionsfilter**: `?institutionId=id`
- **Datumfilter**: `?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD`

### Export-Formate
- **CSV**: `?format=csv` (Excel-kompatibel mit UTF-8 BOM)
- **PDF**: `?format=pdf` (Professionelle Layouts)

## 🔐 Sicherheit

### Authentifizierung
- **JWT-Token**: HttpOnly Cookies
- **Automatische Erneuerung**: Hintergrund-Refresh
- **Session-Management**: Sichere Session-Verwaltung

### Autorisierung
- **Rollenbasierte Zugriffskontrolle** (RBAC)
- **Institution-Isolation**: Einrichtungsleiter sehen nur eigene Daten
- **Gruppen-Isolation**: Erzieher sehen nur zugewiesene Gruppen

### Rate Limiting
- **Standard**: 100 Requests pro 15 Minuten
- **Authentifizierung**: 5 Login-Versuche pro 15 Minuten
- **Datei-Uploads**: 10 Uploads pro Stunde

## 📊 Response-Formate

### Erfolgreiche Antwort
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Fehler-Antwort
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { ... }
  }
}
```

### Paginierte Antwort
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🚨 Fehlercodes

| Code | Beschreibung | HTTP-Status |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | Ungültige Anmeldedaten | 401 |
| `AUTHORIZATION_ERROR` | Unzureichende Berechtigungen | 403 |
| `VALIDATION_ERROR` | Validierungsfehler | 400 |
| `NOT_FOUND` | Ressource nicht gefunden | 404 |
| `CONFLICT` | Ressource bereits vorhanden | 409 |
| `INTERNAL_ERROR` | Server-Fehler | 500 |

## 📝 Hinweise

### Rollen & Berechtigungen
- **SUPER_ADMIN**: Vollzugriff auf alle Endpunkte
- **ADMIN (Einrichtungsleitung)**: Institution-spezifischer Zugriff
- **EDUCATOR**: Gruppen-spezifischer Zugriff
- **PARENT**: Kind-spezifischer Zugriff (geplant)

### Daten-Isolation
- Einrichtungsleiter sehen nur Daten ihrer eigenen Institution
- Erzieher sehen nur Kinder ihrer zugewiesenen Gruppen
- Eltern sehen nur Daten ihrer eigenen Kinder

### Frontend-Filterung
Im Admin-Dashboard werden alle Listen (Kinder, Gruppen, Erzieher, Eltern) und die Empfängerauswahl für Benachrichtigungen zusätzlich im Frontend nach Institution gefiltert. So wird maximale Sicherheit gewährleistet, auch falls der Backend-Filter fehlschlägt.

---

**Alle Endpunkte verwenden JWT-Authentifizierung und sind rollenbasiert geschützt.** 