# 📄 App4KITAs — Technischer Kontext (v2.8)

## 🧩 Projektübersicht
App4KITAs ist eine selbstgehostete, DSGVO-konforme Mobile- und Webplattform zur Anwesenheitskontrolle und Kommunikation in Kindertagesstätten (KITAs) und Horten. Ziel: sichere, moderne und zentrale Lösung für Eltern, Erzieher, und Einrichtungsleiter in Europa.

## 🔐 Authentifizierung & Rollen
- **Login**: E-Mail + Passwort (JWT)
- **Rollen**:
  - `super_admin`: Plattform-Admin
  - `admin`: Institutionsleitung
  - `educator`: Erzieher/in
  - `parent`: Elternteil

## 👑 SUPER_ADMIN Rolle (Plattform-Administrator)

Die Rolle `SUPER_ADMIN` ist der Plattform-Administrator mit den höchsten Rechten im System. Sie ist für die zentrale Verwaltung und Steuerung der gesamten App4KITAs-Plattform zuständig.

### Berechtigungen & Fähigkeiten
- **Vollzugriff auf alle Daten und Funktionen der Plattform**
- Kann neue Institutionen (Kitas) und Admins anlegen, bearbeiten und löschen
- Kann alle Nutzer (Admins, Erzieher, Eltern) verwalten (CRUD)
- Kann Admins Institutionen zuweisen
- Kann Erzieher Gruppen zuweisen
- Kann alle Institutionen, Gruppen und Nutzer einsehen und bearbeiten
- Kann plattformweite Statistiken und Berichte (CSV/PDF) abrufen und exportieren
- Sieht alle Aktivitäten und Nutzungsmetriken der Plattform
- Kann Testdaten und Demo-Nutzer anlegen (z.B. via Seed-Script)

### Technische Umsetzung
- **Frontend:**
  - Zugriff auf das Super Admin Dashboard und alle Management-Seiten nur mit Rolle `SUPER_ADMIN`
  - Navigation und Routen sind rollenbasiert (Sidebar, Schnellzugriffe, etc.)
  - Alle API-Requests für Super Admin nutzen `credentials: 'include'` für sichere Cookie-Authentifizierung
  - UI/UX: Übersichtliche, responsive Karten, Tabellen und Formulare gemäß Designsystem
- **Backend:**
  - Alle kritischen Routen (z.B. `/register`, Nutzer-/Institutionsverwaltung) prüfen `req.user.role === 'SUPER_ADMIN'`
  - Nur `SUPER_ADMIN` darf neue Admins und Institutionen anlegen
  - Seed-Script legt initialen Super Admin aus `.env` an
- **Sicherheit:**
  - Authentifizierung ausschließlich über HttpOnly-Cookies (kein JWT in localStorage)
  - Alle sensiblen Aktionen werden auf Rolle `SUPER_ADMIN` geprüft (Frontend & Backend)

### Datenmodell
- Prisma-Enum: `Role` enthält `SUPER_ADMIN`
- User-Modell: `role: Role` (u.a. SUPER_ADMIN, ADMIN, ...)

### UI/UX Besonderheiten
- Exklusive Navigation und Seiten für Super Admin
- Plattformweite Statistiken, Berichte und Exporte
- Übersicht und Verwaltung aller Kitas, Nutzer und Gruppen
- Modernes, barrierefreies Design gemäß Stylesystem

## 🧩 ADMIN Rolle (Institutionsleitung)

Die Rolle `ADMIN` ist für die Leitung einer einzelnen Kita/Institution zuständig und hat folgende Fähigkeiten und Features im Dashboard:

### Berechtigungen & Fähigkeiten
- **Kinderverwaltung**: Kinder anlegen, bearbeiten, löschen, Foto-Upload, CSV/PDF-Export, Suche, Paginierung, leere Zustände mit Maskottchen
- **Gruppenverwaltung**: Gruppen anlegen, bearbeiten, löschen, Erzieher zuweisen, CSV/PDF-Export, Suche, Paginierung, leere Zustände mit Maskottchen
- **Personalverwaltung**: Erzieher anlegen, bearbeiten, löschen, CSV/PDF-Export, Suche, Paginierung, leere Zustände mit Maskottchen
- **Statistiken**: Check-in/out-Statistiken, Monatsberichte, visuelle Diagramme, Filter (Gruppe, Zeitraum), Export, leere Zustände mit Maskottchen
- **Benachrichtigungen**: Nachrichten an Erzieher oder Gruppen senden, Empfängerauswahl, Verlauf, Validierung, leere Zustände mit Maskottchen
- **Berichte**: Tages- und Monatsberichte, Filter (Datum, Gruppe), CSV-Export, leere Zustände mit Maskottchen
- **Dashboard**: Übersicht mit Schnellzugriffen, Statistiken, Aktivitäten, offene Aufgaben, alles im modernen, barrierefreien Design

### Technische Umsetzung
- **Frontend:**
  - Alle Admin-Seiten sind voll integriert mit dem Backend (API-Routen siehe api_routes_reference.md)
  - CRUD, Suche, Filter, Paginierung, Modals, Datei-Uploads, Export, Validierung, Error/Loading/Empty States
  - UI/UX: Styled Components, Design Tokens, Maskottchen für leere Zustände, responsiv, deutschsprachig
  - Animierte Übergänge, Tooltips, Snackbar-Feedback
- **Backend:**
  - Alle Admin-relevanten Routen prüfen `req.user.role === 'ADMIN'`
  - Datenbankmodelle für Kinder, Gruppen, Erzieher, Check-ins, Berichte, Nachrichten
- **Sicherheit:**
  - Authentifizierung über HttpOnly-Cookies (kein JWT im LocalStorage)
  - Nur Admins der jeweiligen Institution haben Zugriff auf ihre Daten

### UI/UX Besonderheiten
- Modernes, barrierefreies Dashboard mit Maskottchen, leeren Zuständen, Fehler- und Ladeanzeigen
- CSV/PDF-Export für alle relevanten Listen und Berichte
- Modale Dialoge für alle CRUD-Operationen
- Responsive Design für Desktop und Tablet
- Vollständige Integration aller Features laut Projektziel

## 📲 Mobile App (Flutter)
- Einheitlicher Code für Eltern & Erzieher (Rollenbasiert)
- Offline-Modus mit automatischer Synchronisation
- Funktionen:
  - QR-/manuelle Check-ins/-outs
  - Echtzeit-Status & Historie pro Kind
  - Messaging & Notizen (inkl. Dateianhang)
  - Profilbearbeitung + Foto-Upload
  - Push-Benachrichtigungen
  - Multi-Kind-Support (Eltern)
  - Lokale Speicherung (Hive/SQLite)
  - Dark Mode & Sprachumschaltung (i18n)

## 💻 Web Dashboard (React/Vue)
| Rolle         | Zugriff                         | Funktionen                                                   |
|---------------|----------------------------------|---------------------------------------------------------------|
| Super Admin   | Plattformweit                   | Institutionen, Nutzerverwaltung, Abrechnung, Analytik         |
| Admin         | Institutionsintern              | Kinder- & Gruppenverwaltung, QR-Codes, Reports, Nachrichten   |
| Educator      | Gruppenbezogen                  | Check-in/out, Notizen, Gruppen-Chat, Kindprofile              |

Features:
- Responsive Design (Desktop, Tablet)
- Tooltips (Hilfe kontextuell)
- CSV/PDF-Export von Berichten
- Live-Filter, Sortierung, Suche

## 🎨 UX/UI Richtlinien

- **Designprinzipien**:
  - Klare Farbkontraste & Typografie (Inter, Material 3)
  - Minimalistische Navigation
  - Fokus auf Accessibility (WCAG-konform)
  - Dark Mode vollständig unterstützt
  - Intelligentes Feedback (Snackbar, Tooltips)
- **Komponenten**:
  - Rounded Cards, Elevated Buttons
  - Fluid Input Fields mit Fehlerzuständen
  - Animierte Übergänge (z. B. SlideIn, FadeIn, Zoom)
- **Animationen**:
  - `slideLeft`, `bounce`, `fade`, `zoom`, `scale`
  - Kurven: easeIn, easeOut, easeInOut
- **Responsive Verhalten**:
  - Mobile First für App
  - Grid & Flexbox für Dashboard (Desktop/Tablet)
- **i18n**:
  - Vollständig mehrsprachig (mind. Deutsch + Englisch)
- **Modulares Stylesystem**:
  - Gekoppelt an `styles_app4kitas_MODERN.json`

## 🔁 Check-in/-out-System
- **QR-Code** (Backend-generiert, verschlüsselt, scannbar)
- **Manuell** (Button durch Erzieher)
- **Datenprotokoll**: `childId`, `actorId`, `type`, `timestamp`, `method`

## 🔔 Push-Benachrichtigungen (Mobile Only)
- Ereignisse:
  - Check-in/out
  - Abholung in 30 Minuten
  - Fällige Abholung
  - Neue Nachricht/Notiz
- Technologien:
  - FCM (Android/iOS), `flutter_local_notifications`
  - Tokenregistrierung pro Gerät (DSGVO-konform)

## 📬 Messaging & Notizen
- Eltern ↔ Institution (Nachricht + Datei)
- Erzieher ↔ Eltern (pro Kind)
- Klassen-/Gruppenchat
- Dateianhänge: Bilder, PDF (z. B. Attest)
- Speicherung in PostgreSQL

## 🧑‍🎓 Nutzerverwaltung & Profile
- Profil-Editor: Name, Mail, Bild, Passwort
- Eltern: Kinderzuordnung via Admin
- Erzieher: Gruppen-Zuweisung
- Super Admin: Accountanlage manuell

## 📊 Berichte
- Tagesbericht, Monatsübersicht, Verspätungen
- Export als PDF/CSV
- Nur für Admin & Super Admin

## 🗃️ Datenbank (PostgreSQL + Prisma)
- Vollständiges Modell siehe unten
- Unterstützung für Bildpfade (user/avatar, child/photo)
- Logtabellen (Check-in, Notification, Chat)

[Les modèles Prisma sont dans le fichier séparé ou peuvent être ajoutés à la demande.]

## ☁️ Infrastruktur & Sicherheit
- OVH VPS (Frankreich)
- TLS + Datenverschlüsselung (JWT, passwortgehasht)
- Snapshots automatisiert
- Token-Widerruf & Opt-out
- Kein Tracking, keine Drittanbieter

## 🧪 DevOps / CI
- GitHub Actions (build/test/deploy)
- Docker-Compose + Helm Templates (optional)
- Tests: Jest (BE), flutter_test, Cypress (Dashboard)
- Monitoring: Grafana + Loki

_Last updated: v2.8 — Juli 2025_