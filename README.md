# 🧾 App4KITAs

## 📦 Project Overview

**App4KITAs** is a GDPR-compliant childcare platform for Kitas (preschools), offering:

* A **mobile app** for parents and educators (Flutter)
* A **web dashboard** for Super Admins, Admins, and Educators (React)
* A **Node.js + Prisma backend** with PostgreSQL and full API coverage

---

## 🧱 Tech Stack

| Layer    | Tech                                             |
| -------- | ------------------------------------------------ |
| Frontend | React (styled-components, role-based dashboards) |
| Mobile   | Flutter (planned)                                |
| Backend  | Node.js + Express + Prisma ORM                   |
| Database | PostgreSQL                                       |
| Auth     | JWT                                              |
| Hosting  | OVH VPS                                          |
| Styling  | `styles_app4kitas_MODERN.json` design system     |
| Uploads  | Multer (`/uploads`)                              |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/app4kitas.git
cd app4kitas
```

---

### 2. Setup the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
```

Example `.env`:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/app4kitas
JWT_SECRET=supersecurejwtkey
```

Install dependencies:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
mkdir uploads
npm run dev
```

---

### 3. Run the dashboard

```bash
cd ../dashboard
npm install
npm start
```

---

## 🔐 Authentication

* All API requests use JWT-based auth
* Login: `POST /api/login` → returns `token`
* Frontend stores token and adds `Authorization: Bearer <token>` in requests

---

## 📁 File Uploads

* Profile photo: `POST /api/profile/avatar` → form-data: `avatar`
* Child photo: `PUT /api/children/:id/photo` → form-data: `photo`
* Message attachments: `POST /api/message` → form-data: `file` (optional)

---

## 🧪 Testing Guide (Manual QA)

### ✅ Super Admin

* [ ] Login with Super Admin credentials
* [ ] Navigate to "Admins" page
* [ ] Add new admin via modal
* [ ] Test pagination and search
* [ ] Profile dropdown → update profile & avatar
* [ ] Notification bell shows and marks notifications

### ✅ Admin

* [ ] Login as admin
* [ ] Test "Children" page: add, view, upload photo
* [ ] Test "Groups" page: create, assign educators
* [ ] Test profile edit and notification bell

### ✅ Educator

* [ ] Login as educator
* [ ] Check "Check-in" page: check IN/OUT children, history appears
* [ ] Test "Messages" page: send message + upload file
* [ ] Profile update and notification working

---

## 🧩 Routes Summary

→ Use [📚 API-Routenübersicht](#) in your repo or `App4KITAs_context_FINAL_v2.8.md` for full route table.

---

## 🛡️ Security Checklist (To Finalize)

* [ ] Add Helmet for headers
* [ ] Add CORS policy for production
* [ ] Enable HTTPS on server / proxy
* [ ] Add rate-limiting middleware
* [ ] Protect uploads from unauthorized access

---

## 🗃️ Deployment Tips

* Use `pm2` or Docker for backend
* Use `serve` or NGINX for React dashboard
* Host PostgreSQL securely with backups
* Add Sentry/logging for error monitoring

# App4KITAs Dashboard

## Projektüberblick
App4KITAs ist eine moderne, DSGVO-konforme Plattform für Kindertagesstätten (KITAs) zur Verwaltung von Anwesenheit, Gruppen, Personal, Kommunikation und Berichten. Das Dashboard richtet sich an Einrichtungsleiter (Admins), Erzieher und Super Admins.

## Tech Stack
- **Frontend:** React, TypeScript, Styled Components
- **Backend:** Node.js (Express), PostgreSQL, Prisma ORM
- **Design:** Design Tokens, modernes UI, Maskottchen, Dark Mode
- **Auth:** E-Mail + Passwort, JWT/HttpOnly-Cookie

## Hauptfunktionen für Admins
- **Kinderverwaltung:** Anlegen, Bearbeiten, Löschen, Foto-Upload, Suche, Export (CSV/PDF)
- **Gruppenverwaltung:** Anlegen, Bearbeiten, Löschen, Erzieher zuweisen, Suche, Export (CSV/PDF)
- **Personalverwaltung:** Anlegen, Bearbeiten, Löschen, Suche, Export (CSV/PDF)
- **Statistiken:** Check-in/out, Monatsberichte, visuelle Diagramme, Filter, Export
- **Benachrichtigungen:** Nachrichten an Erzieher oder Gruppen, Empfängerauswahl, Verlauf
- **Berichte:** Tages- und Monatsberichte, Filter, Export (CSV)
- **Dashboard:** Übersicht, Schnellzugriffe, Aktivitäten, offene Aufgaben
- **UX:** Modale Dialoge, Maskottchen für leere Zustände, Fehler- und Ladeanzeigen, responsive

## Setup & Installation
1. **Repository klonen:**
   ```
   git clone <repo-url>
   cd kita-app/dashboard
   ```
2. **Abhängigkeiten installieren:**
   ```
   npm install
   ```
3. **Umgebungsvariablen:**
   - `.env` Datei anlegen (siehe Beispiel `.env.example`)
   - Backend-URL und Auth-Settings setzen
4. **Starten:**
   ```
   npm start
   ```
   Das Dashboard läuft standardmäßig auf [http://localhost:3000](http://localhost:3000)

## Nutzung
- **Login:** Mit E-Mail und Passwort anmelden (Rolle: Admin, Erzieher, Super Admin)
- **Navigation:** Sidebar mit rollenbasierten Links (Dashboard, Gruppen, Kinder, Personal, Statistiken, Berichte, Benachrichtigungen)
- **Workflows:**
  - Kinder/Personal/Gruppen anlegen, bearbeiten, löschen über Modale
  - CSV/PDF-Export per Button
  - Berichte filtern und exportieren
  - Nachrichten an Gruppen/Erzieher senden
  - Statistiken und Aktivitäten einsehen

## Entwicklung & Beiträge
- **Code Style:** TypeScript, Styled Components, Design Tokens
- **Tests:** Jest, Cypress (siehe Doku)
- **Beiträge:** Pull Requests willkommen! Bitte vorher Issue anlegen.

## Kontakt & Support
- Fragen, Feedback oder Support: [kontakt@app4kitas.eu](mailto:kontakt@app4kitas.eu)

---
© 2025 App4KITAs – DSGVO-konform, Open Source, Made in Europe
