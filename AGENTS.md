# AGENTS.md — Guide Opérationnel pour Agents et LLM

Ce document consigne le contexte halieutique, les contraintes architecturales, les règles métier et les garde-fous techniques régissant le projet **Pêche — Fiches Techniques Littoral Normand**. Tout agent intervenant sur ce dépôt doit impérativement respecter les directives ci-dessous.

---

## 1. Vue d'Ensemble du Projet & Mission

* **Objectif :** Générer des fiches techniques haute-densité, design et modernes pour la pêche de loisir sur le littoral normand.
* **Double délivrable :**
  1. **Dashboard web interactif :** Consultation mobile et desktop avec 3 modes d'affichage (Vue Dépliée côte-à-côte, Fiches Réversibles 3D, Planches A4) et filtres (zone, catégorie, recherche textuelle).
  2. **Format d'impression physique en Recto/Verso duplex :** Exactement **2 fiches techniques par feuille A4 Paysage (297 × 210 mm)**, chaque espèce bénéficiant d'une **Face A (Recto)** et d'une **Face B (Verso)** au format **A5 portrait (~148 × 210 mm)** prêt pour massicotage central et plastification étanche.
* **Périmètre géographique strict :**
  * **Le Canal de Caen à la mer :** De Caen (Bassin Saint-Pierre / Pont de la Fonderie) jusqu'aux écluses d'Ouistreham (14 km de voie maritime DPM et bassin d'eau douce).
  * **La Côte de Nacre en bateau :** De Ouistreham à Courseulles-sur-Mer, incluant le plateau des Roches du Calvados, les bancs de sable (Lion, Bernières) et les épaves du Débarquement 1944 (Juno, Sword, Gold).

---

## 2. Environnement & Outillage Système

* **OS / Shell :** Windows 11 avec environnement d'exécution bash.
* **Node.js :** `v22.23.2` / **npm :** `10.9.8`
* **Python :** `3.13.14`
* **Git :** `2.51.0` (dépôt initialisé, commits atomiques conventionnels type `feat(data): ...`).

---

## 3. Architecture des Données

L'intégralité du contenu est stockée en fichiers JSON structurés et typés dans le dossier `data/` :

```text
data/
├── species.schema.json       # Schéma JSON Draft-07 officiel
├── species-index.json        # Index des 32 espèces avec statuts et chemins
└── species/                  # 32 fichiers JSON unitaires
    ├── bar-commun.json
    ├── lieu-jaune.json
    ├── daurade-royale.json
    ├── sandre.json
    └── ...
scripts/
└── validate-species.mjs      # Validateur automatisé (schéma, index, densité texte)
```

### Catégories d'espèces (`identity.category`)
Enum strict de 9 valeurs autorisées dans le schéma :
1. `Carnassier marin`
2. `Sparidé`
3. `Poisson plat`
4. `Poisson de roche / épave`
5. `Mugilidé`
6. `Grand migrateur`
7. `Céphalopode`
8. `Carnassier eau douce / saumâtre`
9. `Cyprinidé / Poisson blanc`

---

## 4. Contraintes Physiques & Géométrie d'Impression Duplex (Recto/Verso A5)

Le système d'impression repose sur une architecture **recto/verso par paire** qui double la surface utile par espèce :
* **Format brut d'une carte :** 148,5 × 210 mm (A5 portrait).
* **Surface imprimable nette par face (marges 5 mm déduites) :** ~138 × 200 mm.
* **Répartition logique par face :**
  * **Face A (Recto - Identité & Réglementation) :** En-tête (nom, scientifique, famille, noms locaux normands), encadré des repères d'identification clés, bloc réglementation Manche Est (maille légale, taille éthique, quotas, dates de fermeture, marquage caudal), morphologie & régime, et calendrier d'activité thermique 12 mois (Canal vs Bateau).
  * **Face B (Verso - Terrain, Tactique & Matériel) :** Volet Canal de Caen (postes, déclencheurs éclusées/cargos, techniques, top leurres/appâts), volet Côte de Nacre en bateau (Roches Calvados, épaves 1944, bancs de sable, coefficients, marée, météo), combos matériel (canne/moulinet/ligne) et encadré d'or "Le Secret du Pêcheur Normand".
* **Règle d'imposition d'impression (Retournement sur bords courts) :**
  * *Feuille 1 (Rectos) :* `[ Poisson A - Face A ]` | `[ Poisson B - Face A ]`
  * *Feuille 2 (Versos) :* `[ Poisson B - Face B ]` | `[ Poisson A - Face B ]`
  * Grâce à l'inversion horizontale sur la feuille verso, la découpe centrale à 148,5 mm aligne automatiquement la Face B derrière la Face A pour les deux poissons.
* **Traitement de l'asymétrie écologique :**
  * Pour les espèces d'eau douce (`bateau: false`), la section bateau est masquée sur l'interface pour aérer le volet canal.
  * Pour les espèces marines exclusives (`canal: false`), la section canal est masquée.

---

## 5. Vérités Halieutiques & Juridiques du Secteur (Ne pas halluciner)

Tout agent rédigeant ou modifiant du contenu doit se conformer aux sources officielles normandes :

1. **Lieu jaune (*Pollachius pollachius*) — Révolution 2024/2025 :**
   * Quota : **2 poissons / jour / pêcheur** en Manche (CIEM 7).
   * Fermeture totale : **1er janvier au 30 avril**.
   * **Pêcher-relâcher STRICTEMENT INTERDIT** (Arrêté ministériel du 24/12/2024, art. 3) : la mortalité par décompression (barotraumatisme) sur épaves profondes rend le no-kill létal.
   * Maille : 42 cm, marquage caudal immédiat.
2. **Bar commun (*Dicentrarchus labrax*) en Manche Est (CIEM 7.d) :**
   * Maille légale : **42 cm**.
   * Quota : **2 bars / jour / pêcheur** (janvier et avril-décembre).
   * **No-kill strict obligatoire** du 1er février au 31 mars.
   * Marquage caudal obligatoire (ablation du bas du lobe de la nageoire caudale).
3. **Congre d'Europe :** Maille statutaire officielle de **60 cm** (Annexe I de l'Arrêté ministériel du 26 octobre 2012).
4. **Anguille européenne (En danger critique d'extinction) :**
   * **Pêche de nuit FORMELLEMENT INTERDITE** (Art. R.436-13 du Code de l'environnement).
   * Pêche de l'anguille argentée interdite toute l'année. Anguille jaune autorisée en période diurne restreinte avec **carnet de capture obligatoire** (Art. R.436-64).
5. **Frontière juridique du Canal de Caen :**
   * *Amont du Pont de la Fonderie (Bassin Saint-Pierre) :* Eaux douces fluviales, carte de pêche AAPPMA obligatoire.
   * *Aval du Pont de la Fonderie jusqu'à Ouistreham :* Domaine Public Maritime (DPM), pêche libre sans carte fédérale, mais respect des dates d'ouverture biologiques pour les carnassiers d'eau douce.
6. **Interdictions sanitaires coquillages (DDTM 14) :**
   * Baie de Sallenelles (zone 14-040) et Canal / Port de Caen-Ouistreham (zone 14-045) : **interdiction permanente de récolte de coquillages pour consommation**.
7. **Déclencheurs hydrodynamiques du Canal :**
   * Les éclusées d'Ouistreham (remplissage/vidange des sas) créent un courant d'appel d'eau salée fraîche qui déclenche les chasses.
   * Le passage des cargos/ferries génère un effet de piston scannant les enrochements et délogeant crabes et crevettes.
   * La nuit, les cônes de lumière des lampadaires (Pegasus Bridge, Blainville, Calix) créent une frontière ombre/lumière idéale pour les embuscades.
8. **La Règle des Douzièmes de Marée en Normandie (Côte de Nacre) :**
   * Le marnage en Manche (jusqu'à 7,8 m) découpe chaque demi-marée (6h) en fractions de débit : H1 (1/12), H2 (2/12), H3 (3/12), H4 (3/12), H5 (2/12), H6 (1/12).
   * Les carnassiers actifs (Bar, Lieu au leurre, Maquereau) chassent aux heures de fort courant (H3 et H4 - les deux tiers de 3/12e de mi-marée).
   * Les sparidés et poissons benthiques (Daurade, Sole, Congre, Céphalopodes) exigent des courants modérés ou nuls (H1-H2 ou H5-H6/étales) pour que les lignes tiennent le fond sans dériver trop vite.
   * Chaque fiche intègre obligatoirement la propriété `bateau.tideAndCurrent.ruleOfTwelfths`.

---

## 6. Scripts & Validation

Avant toute soumission de code ou modification de données, exécuter impérativement :

```bash
# Validation complète
npm run validate
# ou node scripts/validate-species.mjs

# Lancement du serveur local avec rechargement automatique (Watch Mode)
npm start
# ou npm run dev (surveille data/, scripts/ et site/ et redémarre automatiquement)

# Recompilation manuelle des données
npm run build
```

Le script vérifie :
1. L'existence physique des 32 fichiers décrits dans `data/species-index.json`.
2. La conformité récursive avec `data/species.schema.json` (types, champs requis, enums).
3. La concordance booléenne des champs `canal.present` et `bateau.present` avec l'index.
4. L'exactitude des tableaux calendaires (exactement 12 entiers compris entre 0 et 3).
5. L'alerte de dépassement de densité texte pour la sauvegarde du gabarit A5.

---

## 7. Directives pour l'Interface Web & le Moteur d'Impression

Le code sous `site/` doit respecter les conventions suivantes :

### A. Les 3 modes d'affichage de l'application
1. **Mode Déplié (`data-mode="duo"`) [Mode par défaut] :**
   * Présente Face A et Face B côte-à-côte dans un grand conteneur `.duo-card`.
   * Hauteur naturelle non contrainte (zéro ascenseur vertical interne, zéro coupure).
   * Responsive : bascule en colonne unique sur écrans < 980 px.
2. **Mode Réversible (`data-mode="flip"`) :**
   * Carte interactive 3D avec bouton `🔄 Tourner la fiche`.
   * Hauteur généreuse fixée à **760 px minimum** (largeur min 440 px) pour contenir l'intégralité des sections sans forcer de défilement.
3. **Mode Planches A4 (`data-mode="print"`) :**
   * Affiche les planches A4 Paysage (`.a4-sheet-preview`) prêtes pour l'impression physique.

### B. Règles CSS & Imposition d'Impression (`@media print`)
```css
@page {
  size: A4 landscape;
  margin: 5mm;
}
.a4-sheet-preview {
  width: 287mm !important;
  height: 200mm !important;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6mm;
  page-break-after: always;
}
```
* Dans le dialogue d'impression navigateur :
  * Format : **A4 Paysage**.
  * Recto-verso : **Retourner sur les bords courts**.
  * Graphismes d'arrière-plan : **Activés**.

---

## 8. Économie de Tokens & Context Engineering (Garde-fous LLM)

Afin d'éviter le phénomène de **Context Flooding** (> 5 000 lignes) et de préserver l'attention et le budget de tokens du modèle, tout agent doit impérativement respecter les règles de ciblage suivantes :

### A. Règle d'or Données : BANNISSEMENT DE LA LECTURE DE `site/data.js`
* **NE JAMAIS LIRE NI CHERCHER DANS `site/data.js`** : Ce fichier est un artefact de compilation de 5 000 lignes (~55 000 tokens). Toute lecture ou recherche globale le ciblant gaspille massivement le contexte.
* Pour consulter ou modifier une espèce : ouvrir exclusivement son fichier unitaire `data/species/<id>.json` (~150 lignes, ~1 500 tokens).
* Pour mettre à jour `site/data.js` après édition d'une espèce, exécuter `npm run build`.

### B. Architecture CSS Modulaire (`site/css/`)
Le CSS est découpé en 7 modules étanches. Pour toute retouche visuelle, charger **uniquement** le module concerné :
* `site/css/01-base.css` (~270 l.) : Tokens racines, reset, typographie, icônes vectorielles SVG, accessibilité motion.
* `site/css/02-themes.css` (~1 500 l.) : Les 11 nuances De School (Éditions Risographe & Nuances Architecturales) en modes Jour et Nuit.
* `site/css/03-header.css` (~635 l.) : Header, champ de recherche, filtres pills, biotope select, popover de thème.
* `site/css/04-views.css` (~670 l.) : Conteneur principal, scroll reveal, Vue Dépliée `.duo-card`, Vue Réversible 3D `.interactive-card`, responsive.
* `site/css/05-card-front.css` (~555 l.) : Face A (titres, repères, cockpit réglementation, jauge de capture, morphologie, heatmap 12 mois, bloc notes).
* `site/css/06-card-back.css` (~625 l.) : Face B (spots canal & mer, déclencheurs éclusées, cockpit marée/météo, jauge douzièmes, armement/leurres, secret normand).
* `site/css/07-print.css` (~285 l.) : Planches A4 paysage duplex, calibration millimétrique A5, règles `@media print`.

*Note :* `site/styles.css` est conservé comme index d'imports `@import` pour compatibilité descendante.

### C. Architecture JS Modulaire en ES Modules (`site/js/`)
L'application JavaScript est découpée en modules ES natifs indépendants :
* `site/js/icons.js` : Bibliothèque d'icônes SVG et helper `uiIcon()`.
* `site/js/theme-controller.js` : Contrôleur des 11 nuances De School, mode clair/sombre et persistance localStorage.
* `site/js/parsers.js` : Algorithmes halieutiques (courbe des douzièmes, coefficients, morphologie, règles de prélèvement).
* `site/js/render-front.js` : Gabarit HTML Face A (Recto).
* `site/js/render-back.js` : Gabarit HTML Face B (Verso).
* `site/js/views.js` : Orchestration des 3 modes d'affichage (Duo, Flip, Print).
* `site/js/app.js` : Orchestration principale, état, filtres et écouteurs d'événements.

