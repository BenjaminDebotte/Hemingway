# Fiches Techniques A4 : Cartographie Vectorielle OSM & Architecture Tactique

## Problem Statement
> **Comment optimiser la Face B (Verso) et le bloc Notes de la Face A (Recto) en mode A4 pour éliminer les étirements artificiels et les intitulés tronqués, tout en intégrant des cartes halieutiques vectorielles authentiques issues d'OpenStreetMap adaptées à l'asymétrie écologique ?**

---

## Architecture Retenue & Décisions Validées

### 1. Intitulés Directs & Suppression du terme « Volet »
* Remplacement des titres bousculés par des intitulés maritimes et fluviaux précis :
  * `⚓ CANAL DE CAEN (DPM & FLUVIO-MARITIME)` au lieu de `Volet Canal de Caen à la mer`.
  * `🚤 CÔTE DE NACRE (LARGE & ÉPAVES)` au lieu de `Volet Côte de Nacre en Bateau`.
* Restructuration de l'en-tête de section (`section-header-row`) pour que le badge de saisonnalité n'écrase plus le titre.

### 2. Élimination du `justify-content: space-between` destructeur
* Remplacement par un espacement fixe (`gap: 1.2mm` à `1.5mm`).
* Les blocs d'information restent compacts, typographiquement denses et équilibrés.

### 3. Gestion de la Cartographie OSM selon l'Asymétrie Écologique

#### A. Cas des Espèces Mixtes (20 espèces : Bar, Lieu, Maquereau, Daurade, Mulet, Calamar...)
* **Face B (Verso) :**
  * Conserve les **deux sections tactiques complètes** (Canal de Caen en haut, Côte de Nacre en bateau en bas).
  * Zéro fusion fade : chaque milieu garde ses spots (enrochements vs roches), ses déclencheurs (éclusées vs marée/douzièmes) et ses combos de matériel.
  * Répartition 50/50 nette sans écrasement mutuel.
* **Face A (Recto) :**
  * Le bloc `Notes` au bas de la fiche est **divisé verticalement en 2 colonnes** :
    * **Colonne Gauche (~65 mm) :** **Mini-Carte Régionale OSM (Canal + Côte de Nacre)** reliant Caen (Bassin St-Pierre), le cours du canal (14 km), l'estuaire d'Ouistreham et le littoral de la Côte de Nacre (Roches du Calvados, bancs de sable et épaves 1944).
    * **Colonne Droite (~70 mm) :** Lignes de notes manuscrites pour les relevés du pêcheur (Date, Coef, Prises, Montages).

#### B. Cas des Espèces Mono-Biotope (12 espèces : Sandre, Brochet, Perche, Silure, Congre, Turbot...)
* **Face A (Recto) :**
  * Le bloc `Notes` reste en **pleine largeur classique** avec ses lignes d'écriture manuscrites intégrales.
* **Face B (Verso) :**
  * La section tactique unique occupe la moitié haute (~110 mm) dans ses proportions naturelles denses.
  * La moitié basse (~75-80 mm) accueille une **Grande Carte Halieutique Vectorielle OSM Dédiée** :
    * *Espèces d'eau douce / saumâtre :* Carte détaillée du Canal de Caen à la mer (14 km) avec les 5 spots chauds (Bassin St-Pierre, Calix, Colombelles, Blainville, Pegasus Bridge, Écluses d'Ouistreham).
    * *Espèces marines exclusives :* Carte détaillée de la Côte de Nacre avec le trait de côte réel (Courseulles ➔ Sallenelles), le plateau des Roches du Calvados, les bancs et les épaves 1944.

---

## Données & Géométrie OpenStreetMap

* **Source officielle :** OpenStreetMap (OSM) via Nominatim (Relation 7403018 pour le Canal) et Overpass (Way coastline Courseulles-Ouistreham, 925 points GPS).
* **Format :** SVG inline pur, sans librairie tierce, zéro dépendance JS lourde.
* **Intégration Thématique :** Tracés stylisés en lignes vectorielles haute-définition (300 DPI) consommant directement les tokens CSS de l'univers actif (`--theme-canal-accent`, `--theme-bateau-accent`, `--theme-text-title`, `--theme-surface-subtle-border`).

---

## Ce Que Nous Ne Faisons Pas (Not Doing & Pourquoi)

* **Pas de fusion des sections Canal et Mer :** L'utilisateur exige le maintien de l'intégrité tactique et individuelle de chaque milieu pour les espèces mixtes.
* **Pas de tuiles cartographiques raster (PNG/JPG) :** La pixellisation est inacceptable pour une fiche technique A5 physique imprimée.
* **Pas de dépendance cartographique externe (Leaflet, Mapbox...) :** Tout le tracé est compilé en chemins vectoriels SVG pré-calculés ultra-rapides (< 10 Ko).

---

## Validation & Garde-fous
- [ ] Le build et la validation du schéma passent (`npm run validate`).
- [ ] L'ensemble des 75 tests de la suite CDP (`npm test`) restent au vert avec adaptation de l'Axe 11 pour la nouvelle géométrie.
- [ ] Zéro régression visuelle sur les 11 univers graphiques (Jour et Nuit).
