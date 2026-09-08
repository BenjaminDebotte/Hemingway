# AGENTS.md — Guide Opérationnel pour Agents et LLM

Ce document consigne le contexte halieutique, les contraintes architecturales, les règles métier et les garde-fous techniques régissant le projet **Pêche — Fiches Techniques Littoral Normand**. Tout agent intervenant sur ce dépôt doit impérativement respecter les directives ci-dessous.

---

## 1. Vue d'Ensemble du Projet & Mission

* **Objectif :** Générer des fiches techniques haute-densité, design et modernes pour la pêche de loisir sur le littoral normand.
* **Double délivrable :**
  1. **Dashboard web interactif :** Consultation mobile et desktop avec filtres (zone, catégorie, saison).
  2. **Format d'impression physique :** Exactement **2 fiches techniques par feuille A4 horizontale (Paysage - 297 × 210 mm)**, soit deux cartes au format **A5 portrait (~148 × 210 mm)**.
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

## 4. Contraintes Physiques & Géométrie d'Impression (A5 Portrait)

La contrainte d'impression (**2 fiches par A4 Paysage**) impose une discipline rédactionnelle absolue :
* **Format brut d'une carte :** 148,5 × 210 mm (A5 portrait).
* **Surface imprimable nette (marges 6 mm déduites) :** ~136,5 × 198 mm.
* **Budget texte maximal :** **2 300 à 2 600 caractères bruts** (environ 4 000 à 4 600 caractères pour le fichier JSON complet incluant les clés).
* **Règles rédactionnelles :**
  * Pas de paragraphes continus de plus de 2 lignes.
  * Privilégier des puces concises (max 70-90 caractères par puce).
  * Chiffrer systématiquement les métriques (grammages, tailles de leurres, diamètres de ligne en centièmes, coefficients de marée).
* **Traitement de l'asymétrie écologique :**
  * Pour les espèces d'eau douce (`bateau: false`), la section bateau est remplie avec les sentinelles neutres (`"Non applicable"`).
  * Pour les espèces marines exclusives (`canal: false`), la section canal est remplie avec `"Non applicable"`.
  * *Règle pour le moteur de rendu HTML :* Lorsque `present === false`, le conteneur correspondant doit être masqué dynamiquement pour redistribuer l'espace vertical au biotope actif.

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

---

## 6. Scripts & Validation

Avant toute soumission de code ou modification de données, exécuter impérativement :

```bash
# Validation complète
npm run validate
# ou node scripts/validate-species.mjs

# Recompilation des données pour le web et l'impression
npm run build
# ou node scripts/build-site.mjs

# Lancement du serveur local de visualisation et d'impression
npm start
```

Le script vérifie :
1. L'existence physique des 32 fichiers décrits dans `data/species-index.json`.
2. La conformité récursive avec `data/species.schema.json` (types, champs requis, enums).
3. La concordance booléenne des champs `canal.present` et `bateau.present` avec l'index.
4. L'exactitude des tableaux calendaires (exactement 12 entiers compris entre 0 et 3).
5. L'alerte de dépassement de densité texte pour la sauvegarde du gabarit A5.

---

## 7. Directives pour les Phases Suivantes (Génération HTML & Print)

Lors de la mise en place du générateur et du design HTML/CSS :
* Conserver l'approche sans dépendances lourdes (Node.js natif ou simple bundler Vite, Tailwind CSS ou CSS moderne avec variables).
* Implémenter un CSS d'impression dédié :
  ```css
  @page {
    size: A4 landscape;
    margin: 6mm;
  }
  .print-sheet {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    page-break-after: always;
  }
  ```
* Veiller à ce qu'une fiche technique ne déborde **JAMAIS** sur une seconde page.
