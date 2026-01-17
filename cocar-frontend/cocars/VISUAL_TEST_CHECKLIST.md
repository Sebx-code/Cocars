# ✅ Checklist Test Visuel - Design System Blanc/Vert

## 🎨 Palette & Tokens
- [ ] Accent principal : emerald-500/600 partout (CTA, badges, focus)
- [ ] Texte sur emerald : blanc (bon contraste)
- [ ] Tokens thème fonctionnent en light/dark :
  - [ ] `card-theme` : blanc (light) / slate-800 (dark)
  - [ ] `text-theme-primary` : noir (light) / blanc (dark)
  - [ ] `text-theme-secondary` : gris-700 (light) / gris-300 (dark)
  - [ ] `text-theme-tertiary` : gris-500 (light) / gris-400 (dark)
  - [ ] `border-theme` : visible dans les deux modes

---

## 🌓 Dark Mode
### Pages publiques
- [ ] **Landing** : hero, sections, CTA, badges → thème cohérent
- [ ] **Login/Signup** : glass cards, inputs, boutons → lisibles
- [ ] **SearchTrips/TripDetail** : cards, filtres, formulaires → contraste OK
- [ ] **CreateTrip** : steps, inputs, progress bar → cohérent

### Dashboards User
- [ ] **UserDashboard** : sidebar, header, quick actions, activity feed → dark OK
- [ ] **MyTrips** : cards, dropdown, empty state → lisible
- [ ] **MyBookings** : cards, statuses, détails → contraste OK
- [ ] **MyRatings** : stats, distribution, liste → thème cohérent
- [ ] **Notifications** : items, hover, timestamps → lisible
- [ ] **UserProfile** : 3 cards, inputs, labels → dark OK

### Dashboards Admin
- [ ] **AdminDashboard** : stats, quick links, activity → thème cohérent
- [ ] **AdminUsers** : table, filtres, avatars → lisible
- [ ] **AdminTrips** : table, filtres, statuses → contraste OK
- [ ] **AdminBookings** : table, statuses → thème cohérent
- [ ] **AdminSettings** : toggles (bg-theme-primary), inputs → dark OK

---

## 🖱️ États interactifs
### Hover
- [ ] CTA primaires : `hover:bg-emerald-700` visible
- [ ] Cards interactives : `hover:border-emerald-400 hover:shadow-xl hover-lift`
- [ ] Liens : `hover:text-emerald-800` (light) / `hover:text-emerald-300` (dark)
- [ ] Boutons secondaires : `hover:bg-theme-secondary`

### Focus
- [ ] Tous les inputs : `focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400`
- [ ] Boutons : outline visible (accessibilité)
- [ ] Liens : outline ou underline visible

### Active
- [ ] Boutons : `active:scale-[0.98]` ou feedback visuel
- [ ] Sidebar active : `bg-emerald-500` (user/admin)

---

## 📱 Responsive
- [ ] **Mobile (< 640px)** : sidebar repliable, cards stack, textes lisibles
- [ ] **Tablet (640-1024px)** : grids 2 colonnes, sidebar visible/cachée
- [ ] **Desktop (> 1024px)** : sidebar fixe, grids 3-4 colonnes, spacing optimal

---

## ✨ Animations & Transitions
- [ ] Hover cards : smooth (duration-200)
- [ ] Toggle switches : transition translate fluide
- [ ] Page transitions : framer-motion sans flash
- [ ] Loaders : emerald-500, animation spin fluide

---

## 🎯 Composants clés
- [ ] **Boutons primaires** : emerald-600 + blanc + hover:emerald-700 + shadow
- [ ] **Badges status** :
  - pending/confirmed : emerald-100/700
  - cancelled : gray-100/secondary
  - rejected : red-100/700
- [ ] **Empty states** : icône + titre + description + CTA → bien centrés
- [ ] **Cards** : rounded-3xl + border-2 + hover-lift + theme cohérent
- [ ] **Inputs** : border-2 + focus emerald + placeholder visible
- [ ] **Dropdowns** : bg-theme-primary + border-theme + hover items

---

## 🔍 Détails finaux
- [ ] Pas de "flash" blanc/noir au chargement (dark mode)
- [ ] Scrollbars : emerald-500 (custom-scrollbar)
- [ ] Selection texte : bg-emerald-500 + text-white
- [ ] Ombres : cohérentes (shadow-lg/xl) + emerald glow si accent
- [ ] Spacing : gaps/paddings harmonieux (4/6/8)

---

## 🚦 Statut global
- [ ] ✅ Light mode : 100% cohérent
- [ ] ✅ Dark mode : 100% cohérent
- [ ] ✅ Responsive : fonctionnel sur toutes tailles
- [ ] ✅ Interactions : smooth et intuitives
- [ ] ✅ Accessibilité : contrastes AA + focus visible

---

**Note** : Tester dans Chrome/Firefox/Safari + mode dark OS activé.
