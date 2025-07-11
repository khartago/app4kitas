# 🏫 App4KITAs - DSGVO-konforme Kita-Management-Plattform

## 📋 Projektübersicht

**App4KITAs** ist eine moderne, selbstgehostete Plattform zur Verwaltung von Kindertagesstätten (KITAs) und Horten. Die Lösung bietet eine vollständige digitale Infrastruktur für Anwesenheitskontrolle, Kommunikation, Berichtswesen und Verwaltung - alles DSGVO-konform und in Europa gehostet.

### 🎯 Zielgruppe
- **Super Admins**: Plattform-Administratoren mit Zugriff auf alle Institutionen
- **Admins**: Einrichtungsleiter mit Verwaltungsrechten für ihre Kita
- **Educators**: Erzieher mit täglichen Arbeitswerkzeugen
- **Parents**: Eltern mit Zugriff auf Informationen ihrer Kinder (geplant)

## 🏗️ Systemarchitektur

### 📱 Multi-Platform-Ansatz
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Web Dashboard  │    │    Backend      │
│   (Flutter)     │    │   (React)       │    │  (Node.js)      │
│                 │    │                 │    │                 │
│ • Eltern        │    │ • Super Admin   │    │ • REST API      │
│ • Erzieher      │    │ • Admin         │    │ • PostgreSQL    │
│ • Offline-Modus │    │ • Educator      │    │ • JWT Auth      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ Technologie-Stack

| Komponente | Technologie | Beschreibung |
|------------|-------------|--------------|
| **Backend** | Node.js + Express + Prisma | RESTful API mit ORM |
| **Datenbank** | PostgreSQL | Relationale Datenbank |
| **Web Dashboard** | React + TypeScript + Styled Components | Moderne Web-Anwendung |
| **Mobile App** | Flutter | Cross-Platform Mobile App |
| **Authentifizierung** | JWT + HttpOnly Cookies | Sichere Session-Verwaltung |
| **Datei-Uploads** | Multer | Sichere Datei-Verwaltung |
| **Hosting** | OVH VPS | Europäisches Hosting |

## 👥 Rollen & Berechtigungen

### 👑 Super Admin
**Zugriff**: Plattform-weit
- **Institutionen verwalten**: Neue KITAs anlegen, bearbeiten, löschen
- **Benutzerverwaltung**: Admins, Erzieher und Eltern verwalten
- **System-Statistiken**: Plattform-weite Analysen und Berichte
- **Export-Funktionen**: CSV/PDF-Export für alle Daten
- **Aktivitätsprotokoll**: Überwachung aller Systemaktivitäten

### 👨‍💼 Admin (Einrichtungsleiter)
**Zugriff**: Institution-spezifisch
- **Kinderverwaltung**: Anlegen, bearbeiten, Fotos, Export
- **Gruppenverwaltung**: Gruppen erstellen, Erzieher zuweisen
- **Personalverwaltung**: Erzieher verwalten und zuweisen
- **Check-in/out**: QR-Code-Generierung und -Verwaltung
- **Berichte**: Tages- und Monatsberichte mit Export
- **Benachrichtigungen**: Nachrichten an Gruppen/Erzieher
- **Institutionseinstellungen**: Öffnungszeiten, Feiertage, Adressen

### 👩‍🏫 Educator (Erzieher)
**Zugriff**: Gruppen-spezifisch
- **Dashboard**: Tagesübersicht und Schnellzugriffe
- **Kinder**: Verwaltung der zugewiesenen Kinder
- **Check-in/out**: QR-Scan und manuelle Check-ins
- **Notizen**: Kind-spezifische Notizen mit Dateianhängen
- **Chat**: Gruppen- und Direktnachrichten
- **Persönliche Aufgaben**: Eigene To-Do-Liste

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 16+ 
- PostgreSQL 12+
- Git

### 1. Repository klonen
```bash
git clone https://github.com/your-org/app4kitas.git
cd app4kitas
```

### 2. Backend einrichten
```bash
cd backend
cp .env.example .env
# .env bearbeiten mit Datenbank-Credentials
```

**Beispiel .env:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/app4kitas
JWT_SECRET=supersecurejwtkey
PORT=4000
```

**Dependencies installieren und Datenbank einrichten:**
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
mkdir uploads
npm run dev
```

### 3. Web Dashboard starten
```bash
cd ../dashboard
npm install
npm start
```

Das Dashboard läuft dann auf `http://localhost:3000`

## 📊 Hauptfunktionen

### 🔐 Authentifizierung & Sicherheit
- **JWT-basierte Authentifizierung** mit HttpOnly Cookies
- **Rollenbasierte Zugriffskontrolle** (RBAC)
- **Sichere Datei-Uploads** mit Validierung
- **Rate Limiting** und CORS-Schutz
- **DSGVO-konforme Datenverarbeitung**

### 📱 Mobile App (Flutter)
- **Einheitlicher Code** für Eltern und Erzieher
- **Offline-Funktionalität** mit automatischer Synchronisation
- **QR-Code-Scanning** für Check-ins
- **Push-Benachrichtigungen** für wichtige Ereignisse
- **Dark Mode** und mehrsprachige Unterstützung

### 💻 Web Dashboard (React)
- **Responsive Design** für Desktop und Tablet
- **Rollenbasierte Navigation** und Zugriffskontrolle
- **Moderne UI/UX** mit Styled Components
- **Export-Funktionen** (CSV/PDF) für alle Berichte
- **Echtzeit-Updates** und Live-Daten

### 📁 Datei-Management
- **Profilbilder**: Upload über `/api/profile/avatar`
- **Kinderfotos**: Upload über `/api/children/:id/photo`
- **Nachrichtenanhänge**: Upload über `/api/message`
- **Notizenanhänge**: Upload über `/api/notes`
- **Unterstützte Formate**: Bilder, PDFs, Dokumente, Archive

### 📈 Berichte & Export
- **Tagesberichte**: Anwesenheit, Verspätungen, Statistiken
- **Monatsberichte**: Detaillierte Analysen und Trends
- **Export-Funktionen**: CSV und PDF für alle Berichte
- **Filter und Suche**: Nach Datum, Gruppe, Kind

### 💬 Kommunikation
- **Gruppen-Chat**: Erzieher-zu-Erzieher Kommunikation
- **Direktnachrichten**: Private Nachrichten zwischen Nutzern
- **Dateianhänge**: Bilder, Dokumente, PDFs
- **Nachrichtenreaktionen**: Emoji-Reaktionen auf Nachrichten
- **Benachrichtigungen**: Push-Notifications für wichtige Ereignisse

## 🗃️ Datenbank-Schema

### Hauptentitäten
- **User**: Benutzer mit Rollen (SUPER_ADMIN, ADMIN, EDUCATOR, PARENT)
- **Institution**: KITAs mit Einstellungen und Öffnungszeiten
- **Child**: Kinder mit Eltern-Zuordnung und Gruppen
- **Group**: Gruppen mit Erzieher-Zuordnung
- **CheckInLog**: Anwesenheitsprotokoll mit QR-Code-Tracking
- **Message**: Nachrichten mit Dateianhängen und Reaktionen
- **Note**: Kind-spezifische Notizen mit Dateianhängen

### Erweiterte Features
- **ChatChannel**: Gruppen-Chats und Direktnachrichten
- **NotificationLog**: Push-Benachrichtigungen und Verlauf
- **ActivityLog**: System-Aktivitätsprotokoll
- **PersonalTask**: Persönliche Aufgaben für Nutzer
- **ClosedDay**: Feiertage und Schließtage-Verwaltung

## 🔧 Entwicklung

### Backend-Entwicklung
```bash
cd backend
npm run dev          # Entwicklungsserver
npm test            # Tests ausführen
npx prisma studio   # Datenbank-Explorer
```

### Frontend-Entwicklung
```bash
cd dashboard
npm start           # Entwicklungsserver
npm run build      # Production Build
npm test           # Tests ausführen
```

### Datenbank-Migrationen
```bash
cd backend
npx prisma migrate dev --name migration_name
npx prisma generate
npx prisma db seed  # Testdaten laden
```

## 🧪 Testing

### Manuelle QA-Checkliste

#### ✅ Super Admin
- [ ] Login mit Super Admin Credentials
- [ ] Institutionen verwalten (anlegen, bearbeiten, löschen)
- [ ] Benutzerverwaltung (Admins, Erzieher, Eltern)
- [ ] System-Statistiken und Berichte
- [ ] Export-Funktionen (CSV/PDF)

#### ✅ Admin (Einrichtungsleiter)
- [ ] Login als Admin
- [ ] Kinderverwaltung (CRUD, Fotos, Export)
- [ ] Gruppenverwaltung (CRUD, Erzieher zuweisen)
- [ ] Personalverwaltung (CRUD, Export)
- [ ] Institutionseinstellungen (Öffnungszeiten, Feiertage)
- [ ] Berichte und Statistiken
- [ ] Benachrichtigungen senden

#### ✅ Educator (Erzieher)
- [ ] Login als Erzieher
- [ ] Dashboard mit Tagesübersicht
- [ ] Kinder verwalten (zugewiesene Gruppen)
- [ ] Check-in/out (QR-Scan, manuell)
- [ ] Notizen erstellen und bearbeiten
- [ ] Chat-Funktionen nutzen
- [ ] Persönliche Aufgaben verwalten

## 🚀 Deployment

### Backend (Node.js)
```bash
# Production Build
npm run build
pm2 start ecosystem.config.js

# Oder mit Docker
docker build -t app4kitas-backend .
docker run -p 4000:4000 app4kitas-backend
```

### Frontend (React)
```bash
# Production Build
npm run build
serve -s build -l 3000

# Oder mit Nginx
nginx -s reload
```

### Datenbank (PostgreSQL)
- **Backup-Strategie**: Automatische Snapshots
- **Monitoring**: Grafana + Prometheus
- **Sicherheit**: TLS-Verschlüsselung, Firewall

## 📚 Dokumentation

### Detaillierte Dokumentation
- **[Dashboard README](./dashboard/README.md)**: Umfassende Web-Dashboard-Dokumentation
- **[Educator Pages README](./dashboard/src/pages/educator/README.md)**: Erzieher-spezifische Features
- **[API-Dokumentation](./shared/api_routes_reference.md)**: Vollständige API-Referenz
- **[Design System](./shared/styles_app4kitas_MODERN.json)**: UI/UX Design-Tokens

### Technische Dokumentation
- **[Projekt-Kontext](./shared/App4KITAs_context_FINAL_v2.8.md)**: Detaillierte technische Spezifikationen
- **Prisma Schema**: Datenbank-Modelle und Beziehungen
- **Komponenten-Dokumentation**: React-Komponenten und Hooks

## 🔒 Sicherheit & Compliance

### DSGVO-Compliance
- **Datenminimierung**: Nur notwendige Daten werden gespeichert
- **Recht auf Löschung**: Vollständige Datenlöschung möglich
- **Datenportabilität**: Export aller persönlichen Daten
- **Transparenz**: Klare Datenschutzerklärung und -prozesse

### Technische Sicherheit
- **Verschlüsselung**: TLS für alle Verbindungen
- **Authentifizierung**: Sichere JWT-Token mit HttpOnly Cookies
- **Autorisierung**: Rollenbasierte Zugriffskontrolle
- **Input-Validierung**: Schutz vor XSS und Injection-Angriffen

## 🤝 Beitragen

### Entwicklungsworkflow
1. **Issue erstellen** für neue Features oder Bugs
2. **Feature-Branch** von main erstellen
3. **Änderungen implementieren** mit Tests
4. **Pull Request** mit Beschreibung erstellen
5. **Code Review** und Merge

### Coding Standards
- **TypeScript**: Strikte Typisierung für alle Frontend-Komponenten
- **ESLint**: Code-Qualität und Konsistenz
- **Prettier**: Automatische Code-Formatierung
- **Tests**: Unit- und Integration-Tests für kritische Funktionen

## 📞 Support & Kontakt

### Hilfe bekommen
- **Dokumentation**: Umfassende README-Dateien und API-Docs
- **Issues**: GitHub Issues für Bugs und Feature-Requests
- **Discussions**: GitHub Discussions für Fragen und Ideen

### Kontakt
- **E-Mail**: [kontakt@app4kitas.eu](mailto:kontakt@app4kitas.eu)
- **GitHub**: [https://github.com/your-org/app4kitas](https://github.com/your-org/app4kitas)

## 📄 Lizenz

Dieses Projekt ist Teil der App4KITAs-Plattform. Siehe die Hauptprojekt-Lizenz für Details.

---

**App4KITAs** - DSGVO-konforme, moderne Kita-Management-Plattform aus Europa 🇪🇺
