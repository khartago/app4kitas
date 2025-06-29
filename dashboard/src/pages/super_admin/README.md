# 🏢 Super Admin Dashboard - App4KITAs

## 📋 Übersicht

Das Super Admin Dashboard ist die zentrale Verwaltungsoberfläche für die App4KITAs Plattform. Es ermöglicht Super Admins die vollständige Kontrolle über alle Institutionen, Benutzer und Systemeinstellungen.

## 🔐 Zugriffsberechtigung

- **Rolle**: `SUPER_ADMIN`
- **Berechtigungen**: Vollzugriff auf alle Funktionen der Plattform
- **Zugriff**: Nur nach erfolgreicher Authentifizierung

## 📁 Seitenübersicht

### 1. 🏠 Dashboard (`Dashboard.tsx`)
**Hauptübersicht mit Statistiken und Systemstatus**

**Features:**
- 📊 Echtzeit-Statistiken (Benutzer, Institutionen, Aktivitäten)
- 📈 Grafische Darstellung der Plattform-Nutzung
- 🚀 Schnellzugriff auf wichtige Funktionen
- 📱 Responsive Design für alle Geräte

**API-Endpunkte:**
- `GET /api/stats` - Plattform-Statistiken abrufen

---

### 2. 👥 Eltern-Verwaltung (`Parents.tsx`)
**Verwaltung aller Eltern-Konten in der Plattform**

**Features:**
- ✅ **CRUD-Operationen**: Erstellen, Lesen, Bearbeiten, Löschen von Eltern-Konten
- 🔍 **Erweiterte Suche**: Suche nach Name, E-Mail oder ID
- 📄 **Paginierung**: Effiziente Darstellung großer Datenmengen
- 📊 **Export-Funktionen**: CSV und PDF Export
- 🚫 **Duplikat-Prävention**: Verhindert doppelte E-Mail-Adressen und Namen
- ⚠️ **Lösch-Bestätigung**: Sicherheitsabfrage vor dem Löschen

**Formular-Felder:**
- Name (erforderlich)
- E-Mail (erforderlich, eindeutig)
- Passwort (erforderlich)

**API-Endpunkte:**
- `GET /api/users?role=PARENT` - Alle Eltern abrufen
- `POST /api/register` - Neuen Eltern-Account erstellen
- `PUT /api/users/:id` - Eltern-Daten bearbeiten
- `DELETE /api/users/:id` - Eltern-Account löschen

---

### 3. 👨‍🏫 Erzieher-Verwaltung (`Educators.tsx`)
**Verwaltung aller Erzieher-Konten und deren Zuordnung**

**Features:**
- ✅ **CRUD-Operationen**: Vollständige Verwaltung von Erzieher-Konten
- 🏫 **Institutions-Zuordnung**: Automatische Zuordnung zu Institutionen
- 👥 **Gruppen-Zuordnung**: Mehrfachauswahl von Gruppen
- 🔍 **Erweiterte Suche**: Suche nach Name, E-Mail oder Institution
- 📄 **Paginierung**: Effiziente Darstellung
- 📊 **Export-Funktionen**: CSV und PDF Export
- 🚫 **Duplikat-Prävention**: Verhindert doppelte E-Mail-Adressen
- ⚠️ **Lösch-Bestätigung**: Sicherheitsabfrage

**Formular-Felder:**
- Name (erforderlich)
- E-Mail (erforderlich, eindeutig)
- Passwort (erforderlich)
- Institution (erforderlich, Dropdown)
- Gruppen (optional, Mehrfachauswahl)

**API-Endpunkte:**
- `GET /api/users?role=EDUCATOR` - Alle Erzieher abrufen
- `GET /api/institutionen` - Institutionen für Dropdown
- `GET /api/groups` - Gruppen für Mehrfachauswahl
- `POST /api/register` - Neuen Erzieher-Account erstellen
- `PUT /api/users/:id` - Erzieher-Daten bearbeiten
- `DELETE /api/users/:id` - Erzieher-Account löschen

---

### 4. 🏢 Institutionen & Admins (`Institutionen.tsx`)
**Zentrale Verwaltung von Institutionen und deren Administratoren**

**Features:**
- 🏢 **Institutionen-Verwaltung**: CRUD für Kita-Institutionen
- 👨‍💼 **Admin-Verwaltung**: CRUD für Institution-Admins
- 🔗 **Zuordnung**: Admins werden automatisch Institutionen zugeordnet
- 🔍 **Erweiterte Suche**: Separate Suche für Admins und Institutionen
- 📄 **Paginierung**: Effiziente Darstellung
- 📊 **Export-Funktionen**: CSV und PDF Export
- 🚫 **Duplikat-Prävention**: Verhindert doppelte Namen und E-Mails
- ⚠️ **Lösch-Bestätigung**: Sicherheitsabfrage

**Institutionen-Formular:**
- Name (erforderlich, eindeutig)
- Adresse (optional)

**Admin-Formular:**
- Name (erforderlich)
- E-Mail (erforderlich, eindeutig)
- Passwort (erforderlich)
- Institution (erforderlich, Dropdown)

**API-Endpunkte:**
- `GET /api/users?role=ADMIN` - Alle Admins abrufen
- `GET /api/institutionen` - Alle Institutionen abrufen
- `POST /api/register` - Neuen Admin-Account erstellen
- `POST /api/institutionen` - Neue Institution erstellen
- `PUT /api/users/:id` - Admin-Daten bearbeiten
- `PUT /api/institutionen/:id` - Institution bearbeiten
- `DELETE /api/users/:id` - Admin-Account löschen
- `DELETE /api/institutionen/:id` - Institution löschen

---

### 5. 📊 Statistiken (`Statistiken.tsx`)
**Detaillierte Plattform-Statistiken und Analysen**

**Features:**
- 📈 **Benutzer-Statistiken**: Anzahl nach Rollen
- 🏫 **Institutions-Statistiken**: Aktivität und Nutzung
- 📊 **Grafische Darstellung**: Charts und Diagramme
- 📅 **Zeitraum-Filter**: Anpassbare Zeiträume
- 📱 **Responsive Design**: Optimiert für alle Geräte

**API-Endpunkte:**
- `GET /api/stats` - Plattform-Statistiken
- `GET /api/reports/user-growth` - Benutzer-Wachstum
- `GET /api/reports/active-users` - Aktive Benutzer
- `GET /api/reports/checkin-trends` - Check-in-Trends

---

### 6. 📋 Berichte (`Reports.tsx`)
**Umfassende Berichterstattung und Export-Funktionen**

**Features:**
- 📅 **Tagesberichte**: Detaillierte Tagesübersichten
- 📊 **Monatsberichte**: Monatliche Zusammenfassungen
- ⏰ **Verspätungsberichte**: Analyse von Spätabholungen
- 📈 **Trend-Analysen**: Benutzer- und Aktivitäts-Trends
- 📊 **Export-Funktionen**: CSV und PDF Export
- 🔍 **Filter-Optionen**: Nach Datum, Gruppe, Institution
- 📱 **Responsive Design**: Optimiert für alle Geräte

**Bericht-Typen:**
- Tagesberichte
- Monatsberichte
- Verspätungsberichte
- Benutzer-Wachstum
- Aktive Benutzer
- Check-in-Trends
- Aktive Gruppen
- Nachrichten-Volumen
- Benachrichtigungs-Statistiken
- Fehlgeschlagene Anmeldungen

**API-Endpunkte:**
- `GET /api/reports/daily` - Tagesberichte
- `GET /api/reports/monthly` - Monatsberichte
- `GET /api/reports/late-pickups` - Verspätungsberichte
- `GET /api/reports/*/export` - Export-Funktionen

## 🔧 Technische Details

### Komponenten-Struktur
```
super_admin/
├── Dashboard.tsx          # Hauptübersicht
├── Parents.tsx           # Eltern-Verwaltung
├── Educators.tsx         # Erzieher-Verwaltung
├── Institutionen.tsx     # Institutionen & Admins
├── Statistiken.tsx       # Statistiken
├── Reports.tsx           # Berichte
└── README.md            # Diese Dokumentation
```

### Verwendete UI-Komponenten
- **CrudPage**: Zentrale CRUD-Seiten-Komponente
- **DataTable**: Erweiterte Tabellen-Komponente
- **ModernModal**: Moderne Modal-Dialoge
- **DeleteConfirmationModal**: Lösch-Bestätigung
- **AnimatedMascotsLoader**: Lade-Animationen

### Sicherheitsfeatures
- ✅ **Authentifizierung**: JWT-basierte Authentifizierung
- 🔐 **Autorisierung**: Rollenbasierte Zugriffskontrolle
- 🚫 **Duplikat-Prävention**: Verhindert doppelte Daten
- ⚠️ **Lösch-Bestätigung**: Sicherheitsabfragen
- 📝 **Validierung**: Client- und Server-seitige Validierung

### API-Integration
- **Base URL**: `http://localhost:4000/api`
- **Authentication**: Cookie-basierte JWT-Tokens
- **Error Handling**: Umfassende Fehlerbehandlung
- **Loading States**: Benutzerfreundliche Lade-Zustände

## 🚀 Verwendung

### 1. Anmeldung
```typescript
// Nur SUPER_ADMIN Benutzer haben Zugriff
if (benutzer?.role !== 'SUPER_ADMIN') {
  return <ErrorMsg>Zugriff verweigert</ErrorMsg>;
}
```

### 2. Daten laden
```typescript
const load = async () => {
  setLoading(true);
  try {
    const data = await fetchUsers();
    setUsers(data);
  } catch (e: any) {
    setError(e.message);
  }
  setLoading(false);
};
```

### 3. CRUD-Operationen
```typescript
// Erstellen
const handleAdd = async () => {
  const duplicateCheck = checkForDuplicates(form, users, ['name', 'email']);
  if (duplicateCheck.isDuplicate) {
    setFormError(`Duplikat gefunden: ${duplicateCheck.duplicateValue}`);
    return;
  }
  await addUser(form);
  await load();
};

// Bearbeiten
const handleEdit = async (row: any) => {
  await editUser(row.id, row);
  await load();
};

// Löschen
const handleDelete = async (row: any) => {
  await deleteUser(row.id);
  await load();
};
```

## 📱 Responsive Design

Alle Seiten sind vollständig responsive und optimiert für:
- 🖥️ Desktop (1200px+)
- 💻 Laptop (768px - 1199px)
- 📱 Tablet (481px - 767px)
- 📱 Mobile (320px - 480px)

## 🔄 State Management

- **Local State**: React useState für Komponenten-spezifische Daten
- **User Context**: Globale Benutzerdaten
- **Loading States**: Benutzerfreundliche Lade-Indikatoren
- **Error Handling**: Umfassende Fehlerbehandlung

## 🎨 Design System

- **Farben**: Konsistente Farbpalette aus dem Design System
- **Typography**: Plus Jakarta Sans Font Family
- **Spacing**: Einheitliche Abstände und Padding
- **Components**: Wiederverwendbare UI-Komponenten

## 🚀 Performance

- **Lazy Loading**: Komponenten werden bei Bedarf geladen
- **Pagination**: Effiziente Darstellung großer Datenmengen
- **Debounced Search**: Optimierte Suchfunktionen
- **Memoization**: React.memo für Performance-Optimierung

## 🔧 Entwicklung

### Neue Seite hinzufügen
1. Komponente in `super_admin/` erstellen
2. Route in `SuperAdminRoutes.tsx` hinzufügen
3. Navigation in `Sidebar.tsx` hinzufügen
4. API-Service in `superAdminApi.ts` erstellen
5. Dokumentation in diesem README aktualisieren

### Best Practices
- ✅ Verwende die `CrudPage` Komponente für CRUD-Operationen
- ✅ Implementiere Duplikat-Prävention mit `checkForDuplicates`
- ✅ Verwende `DeleteConfirmationModal` für Lösch-Operationen
- ✅ Implementiere umfassende Fehlerbehandlung
- ✅ Verwende TypeScript für Typsicherheit
- ✅ Teste auf allen Bildschirmgrößen

## 📞 Support

Bei Fragen oder Problemen:
1. Überprüfe die Browser-Konsole auf Fehler
2. Überprüfe die Network-Tab auf API-Fehler
3. Überprüfe die Backend-Logs
4. Kontaktiere das Entwicklungsteam

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: Dezember 2024  
**Entwickler**: App4KITAs Team 