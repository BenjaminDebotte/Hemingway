# 🐟 Fiches Techniques Pêche — Littoral Normand

> Système de génération de fiches techniques halieutiques haute-densité et design, dédié à la pêche sur le littoral normand : **Canal de Caen à la mer** et **Côte de Nacre en bateau**.

[![Dataset](https://img.shields.io/badge/Espèces-32%20Validées-blue.svg)](#-catalogue-des-32-espèces)
[![Zone](https://img.shields.io/badge/Zone-Manche%20Est%20(CIEM%207.d)-emerald.svg)](#-cadre-réglementaire--éthique-calvados)
[![Print Format](https://img.shields.io/badge/Impression-2%20Fiches%20%2F%20A4%20Paysage-purple.svg)](#-spécifications-dimpression-a4--a5)
[![Validation](https://img.shields.io/badge/Validation-Schema%20JSON%20Strict-green.svg)](#-validation-automatisée)

---

## 📖 Sommaire

1. [Présentation du Projet](#-présentation-du-projet)
2. [Périmètre Géographique & Biotopes](#-périmètre-géographique--biotopes)
3. [Structure d'une Fiche Technique](#-structure-dune-fiche-technique)
4. [Catalogue des 32 Espèces](#-catalogue-des-32-espèces)
5. [Cadre Réglementaire & Éthique (Calvados)](#-cadre-réglementaire--éthique-calvados)
6. [Architecture des Données & Schéma](#-architecture-des-données--schéma)
7. [Validation Automatisée](#-validation-automatisée)
8. [Spécifications d'Impression (A4 & A5)](#-spécifications-dimpression-a4--a5)
9. [Feuille de Route & Prochaines Étapes](#-feuille-de-route--prochaines-étapes)

---

## 🎯 Présentation du Projet

Ce projet a pour objectif d'offrir aux pêcheurs de loisir normands un guide de terrain synthétique, précis et esthétique. Il combine deux modes d'exploitation complémentaires :
* **Un dashboard web moderne et responsive :** Consultable sur smartphone au bord de l'eau ou sur le bateau, avec filtrage multicritères (par milieu, famille, saison d'activité).
* **Une collection de fiches imprimables haute-définition :** Calibrée pour que **deux fiches techniques tiennent sur une seule feuille A4 horizontale**, produisant deux fiches au format **A5 portrait (~148 × 210 mm)** idéales à plastifier ou à relier en carnet de bord étanche.

---

## 🌊 Périmètre Géographique & Biotopes

Le projet couvre deux écosystèmes complémentaires et hyper-productifs du département du Calvados :

```
                        [ MER DE LA MANCHE (Côte de Nacre) ]
             Roches du Calvados (Lion/Luc) | Épaves D-Day 1944 | Bancs de Bernières
                                        │
                                        ▼ (Sas éclusier & Avant-port)
                           [ OUISTREHAM - ÉCLUSES ]
                                        │
                           (Domaine Public Maritime - DPM)
                                        │
                     Bénouville / Pegasus Bridge (Enrochements & Ombrages)
                                        │
                       Blainville-sur-Orne (Darses & Bassins profonds)
                                        │
                      Colombelles / Hérouville (Palplanches métalliques)
                                        │
                           Viaduc de Calix (Fosses de dragage)
                                        │
                        ────── Pont de la Fonderie ────── (Limite LSE)
                                        │
                          (Domaine Fluvial d'Eau Douce)
                                        │
                            [ CAEN - BASSIN SAINT-PIERRE ]
```

### 1. Le Canal de Caen à la mer (14 km)
* **Caractéristiques :** Voie d'eau de 8 à 9 m de profondeur et 40 à 60 m de largeur reliant le cœur de Caen à la mer. Chenal saumâtre à fort gradient de salinité protégé des coups de vent extérieurs.
* **Structures clés :** Talus d'enrochements artificiels (*riprap*), rideaux de palplanches métalliques verticales encroûtées de moules, piles de ponts historiques (Pegasus Bridge, Viaduc de Calix), ducs d'Albe, collecteurs d'eaux pluviales et berges boisées ombragées (saules et peupliers de Ranville).
* **Déclencheurs d'activité :** 
  * L'ouverture des sas de l'écluse d'Ouistreham génère un courant de chasse d'eau salée fraîche hautement oxygénée.
  * L'effet piston des cargos et des ferries racle les berges et décroche les crabes et crevettes bouquets.
  * Les cônes d'éclairage urbain nocturne attirent le plancton et les sprats, créant des couloirs de chasse à la frontière de l'ombre.

### 2. La Côte de Nacre en bateau (Ouistreham à Courseulles)
* **Les Roches du Calvados :** Immense plateau calcaire jurassique de 15 km au large de Lion-sur-Mer, Luc-sur-Mer et Bernières. Champs denses de laminaires, moulières naturelles, crevettes, araignées et tourteaux.
* **Les Épaves du Débarquement 1944 (Opération Neptune) :** Plus de 150 épaves historiques (navires de guerre, transports *Susan B. Anthony*, *Empire Broadsword*, caissons Phoenix d'Arromanches) gisant entre 15 et 35 m de fond, véritables récifs artificiels abritant les géants du large.
* **Dynamique des Marées :** Régime macrotidal puissant (jusqu'à 7,8 m de marnage). Flot portant à l'Est, Jusant portant à l'Ouest. Dérives tactiques en mortes-eaux (coeff 40-60 sur épaves profondes) ou chasses en vives-eaux (coeff 70-95 sur les pointes rocheuses).

---

## 📑 Structure d'une Fiche Technique

Chaque fiche respecte un canevas en 5 blocs calibrés pour tenir sur une page A5 sans débordement :

1. **🏷️ En-tête & Identité :** Nom officiel, nom scientifique, famille, appellations locales normandes, points clés d'identification visuelle immédiate.
2. **⚖️ Réglementation & Biologie :** Maille légale Manche Est (CIEM 7.d), taille éthique conseillée, quota journalier par pêcheur, périodes de fermeture biologique, règles spécifiques (ablation caudale, carnet de capture, statut DPM). Tailles et poids moyens/maxima, régime alimentaire.
3. **⚓ Volet Canal de Caen à la mer :** Présence, saisonnalité, postes types (enrochements, palplanches, piles de pont, berges arborées, structures portuaires), déclencheurs (éclusées, passage de navires, éclairage nocturne, turbidité), techniques et leurres/appâts phares.
4. **🚤 Volet Côte de Nacre en bateau :** Présence, saisonnalité, habitats (Roches du Calvados, épaves 1944, bancs de sable), coefficients de marée idéaux, phases de courant (flot/jusant), impact des vents (Nord-Est haché vs Sud/SO plat), techniques bateau (traction, ascenseur, dérive au lançon, tenya).
5. **🎯 Matériel, Calendrier & Secret Local :** Combos canne/moulinet/ligne spécifiques pour le canal et le bateau, accessoires indispensables, calendrier mensuel d'activité (12 mois notés de 0 à 3), et l'astuce secrète du pêcheur local normand.

---

## 📋 Catalogue des 32 Espèces

| # | Espèce | Nom Scientifique | Catégorie | Canal | Bateau | Fichier JSON |
|---|---|---|---|:---:|:---:|---|
| 1 | **Bar commun (franc)** | *Dicentrarchus labrax* | Carnassier marin | Oui | Oui | `data/species/bar-commun.json` |
| 2 | **Bar moucheté** | *Dicentrarchus punctatus* | Carnassier marin | Oui | Oui | `data/species/bar-mouchete.json` |
| 3 | **Lieu jaune** | *Pollachius pollachius* | Carnassier marin | Oui | Oui | `data/species/lieu-jaune.json` |
| 4 | **Maquereau commun** | *Scomber scombrus* | Carnassier marin | Oui | Oui | `data/species/maquereau-commun.json` |
| 5 | **Orphie (Aiguillette)** | *Belone belone* | Carnassier marin | Oui | Oui | `data/species/orphie.json` |
| 6 | **Merlan** | *Merlangius merlangus* | Carnassier marin | Oui | Oui | `data/species/merlan.json` |
| 7 | **Tacaud commun** | *Trisopterus luscus* | Carnassier marin | Oui | Oui | `data/species/tacaud.json` |
| 8 | **Daurade royale** | *Sparus aurata* | Sparidé | Oui | Oui | `data/species/daurade-royale.json` |
| 9 | **Daurade grise (Griset)** | *Spondyliosoma cantharus* | Sparidé | Non | Oui | `data/species/daurade-grise.json` |
| 10 | **Flet commun** | *Platichthys flesus* | Poisson plat | Oui | Oui | `data/species/flet-commun.json` |
| 11 | **Plie commune (Carrelet)** | *Pleuronectes platessa* | Poisson plat | Oui | Oui | `data/species/plie-commune.json` |
| 12 | **Sole commune** | *Solea solea* | Poisson plat | Oui | Oui | `data/species/sole-commune.json` |
| 13 | **Turbot** | *Scophthalmus maximus* | Poisson plat | Non | Oui | `data/species/turbot.json` |
| 14 | **Vieille commune** | *Labrus bergylta* | Poisson de roche / épave | Non | Oui | `data/species/vieille-commune.json` |
| 15 | **Congre d'Europe** | *Conger conger* | Poisson de roche / épave | Oui | Oui | `data/species/congre-europe.json` |
| 16 | **Mulet lippu** | *Chelon labrosus* | Mugilidé | Oui | Oui | `data/species/mulet-lippu.json` |
| 17 | **Mulet doré** | *Chelon auratus* | Mugilidé | Oui | Oui | `data/species/mulet-dore.json` |
| 18 | **Mulet porc** | *Chelon ramada* | Mugilidé | Oui | Non | `data/species/mulet-porc.json` |
| 19 | **Truite de mer** | *Salmo trutta trutta* | Grand migrateur | Oui | Oui | `data/species/truite-de-mer.json` |
| 20 | **Alose feinte** | *Alosa fallax* | Grand migrateur | Oui | Oui | `data/species/alose-feinte.json` |
| 21 | **Anguille européenne** | *Anguilla anguilla* | Grand migrateur | Oui | Non | `data/species/anguille-europe.json` |
| 22 | **Seiche commune (Casserons)**| *Sepia officinalis* | Céphalopode | Oui | Oui | `data/species/seiche-commune.json` |
| 23 | **Calamar commun (Encornet)**| *Loligo vulgaris* | Céphalopode | Oui | Oui | `data/species/calamar-commun.json` |
| 24 | **Sandre** | *Sander lucioperca* | Carnassier eau douce / saumâtre | Oui | Non | `data/species/sandre.json` |
| 25 | **Perche commune** | *Perca fluviatilis* | Carnassier eau douce / saumâtre | Oui | Non | `data/species/perche-commune.json` |
| 26 | **Brochet** | *Esox lucius* | Carnassier eau douce / saumâtre | Oui | Non | `data/species/brochet.json` |
| 27 | **Silure glane** | *Silurus glanis* | Carnassier eau douce / saumâtre | Oui | Non | `data/species/silure-glane.json` |
| 28 | **Carpe commune (Miroir)** | *Cyprinus carpio* | Cyprinidé / Poisson blanc | Oui | Non | `data/species/carpe-commune.json` |
| 29 | **Gardon commun** | *Rutilus rutilus* | Cyprinidé / Poisson blanc | Oui | Non | `data/species/gardon-commun.json` |
| 30 | **Brème commune** | *Abramis brama* | Cyprinidé / Poisson blanc | Oui | Non | `data/species/breme-commune.json` |
| 31 | **Tanche** | *Tinca tinca* | Cyprinidé / Poisson blanc | Oui | Non | `data/species/tanche.json` |
| 32 | **Ablette commune** | *Alburnus alburnus* | Cyprinidé / Poisson blanc | Oui | Non | `data/species/ablette-commune.json` |

---

## ⚖️ Cadre Réglementaire & Éthique (Calvados)

Toutes les données ont été calées sur les arrêtés ministériels et préfectoraux officiels en vigueur :

* **Lieu jaune (*Arrêté ministériel du 24 décembre 2024*) :** Quota de **2 poissons/jour**, fermeture totale du **1er janvier au 30 avril**, et **interdiction stricte du pêcher-relâcher** en Manche (zone CIEM 7) pour éviter le gaspillage biologique par barotraumatisme sur épave.
* **Bar commun (*Règlements UE 2024/257 & 2025/202*) :** Maille **42 cm**, quota de **2 bars/jour** (hors février-mars), **no-kill strict obligatoire du 1er février au 31 mars**.
* **Obligation de marquage caudal (*Arrêté du 17 mai 2011 modifié*) :** Coupe nette du bas du lobe de la nageoire caudale dès la mise au sec pour Bar commun, Lieu jaune, Daurade royale, Maquereau et Sole.
* **Congre d'Europe :** Taille minimale obligatoire de **60 cm** (*Annexe I Arrêté 26/10/2012*).
* **Anguille européenne (UICN Danger critique) :** Pêche de nuit formellement interdite (*Art. R.436-13*), carnet de capture obligatoire (*Art. R.436-64*), anguille argentée interdite toute l'année.
* **Frontière juridique du Canal de Caen :**
  * *En amont du Pont de la Fonderie :* Domaine fluvial d'eau douce (carte AAPPMA obligatoire).
  * *En aval du Pont de la Fonderie :* Domaine Public Maritime (DPM), pêche libre sans permis fédéral.
* **Arrêtés sanitaires conchylicoles (*DDTM 14*) :** Interdiction absolue de ramassage de coquillages dans la baie de Sallenelles (14-040) et dans le canal portuaire de Caen-Ouistreham (14-045).

---

## 🗄️ Architecture des Données & Schéma

Le schéma formel est spécifié dans `data/species.schema.json` (Draft-07). 

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FicheTechniquePoissonNormandie",
  "required": [
    "id", "identity", "regulations", "biology",
    "canal", "bateau", "gear", "calendar", "localSecret"
  ]
}
```

Toutes les espèces sont indexées dans `data/species-index.json`, garantissant une synchronisation permanente entre les drapeaux d'environnement et les fichiers unitaires.

---

## 💻 Utilisation & Commandes

Le projet fonctionne sans dépendances lourdes grâce à Node.js natif :

```bash
# Valider l'intégrité de la base de données (schéma, index et densité texte)
npm run validate

# Compiler et assembler les 32 fiches dans l'application web
npm run build

# Démarrer le serveur local de visualisation et d'impression
npm start
# ➡️ Accédez à l'application sur : http://localhost:3000
```

> **Astuce :** Vous pouvez également ouvrir directement `site/index.html` dans votre navigateur (Chrome, Edge, Firefox) sans aucun serveur : le fichier `site/data.js` fonctionne de manière 100 % autonome sans blocage CORS.

---

## 🧪 Validation Automatisée

Le projet intègre un outil d'assurance qualité scripté en Node.js :

```bash
node scripts/validate-species.mjs
```

### Contrôles exécutés :
1. ✅ **Intégrité structurelle :** Vérification de tous les champs obligatoires et des types de données.
2. ✅ **Enums stricts :** Respect des 9 catégories d'espèces et des valeurs de statut.
3. ✅ **Cohérence écologique :** Concordance stricte entre `species-index.json` et les champs `canal.present` et `bateau.present`.
4. ✅ **Validité calendaire :** Tableaux mensuels de 12 entiers (valeurs 0 à 3).
5. ✅ **Contrôle de densité texte :** Détection des fiches risquant de dépasser le gabarit d'impression A5.

---

## 📐 Spécifications d'Impression (A4 & A5)

* **Format du support papier :** Feuille standard **A4 Paysage (297 × 210 mm)**.
* **Agencement :** Grille 2 colonnes (2 fiches A5 Portrait de 148,5 × 210 mm côte à côte).
* **Zone imprimable utile :** Marges de sécurité de 6 mm $\rightarrow$ surface active de **136,5 × 198 mm**.
* **Densité typographique :** Police de labeur 7,5 à 8 pt avec interlignage 10 pt.
* **Comportement dynamique :** Pour les espèces à milieu unique (ex: poisson d'eau douce sans volet bateau, ou poisson du large sans volet canal), le conteneur inactif est masqué afin d'éviter les lignes *"Non applicable"* et d'offrir une respiration visuelle au biotope actif.

---

## 🚀 Feuille de Route & Prochaines Étapes

- [x] **Phase 1 : Définition & Modélisation**
  - [x] Définition des besoins et de la contrainte physique (2 fiches / A4 paysage).
  - [x] Recherche réglementaire et halieutique poussée sur le Canal et la Côte de Nacre.
  - [x] Création du schéma JSON strict (`data/species.schema.json`).
  - [x] Rédaction et validation des 32 fiches techniques complètes (`data/species/*.json`).
  - [x] Création du validateur automatisé (`scripts/validate-species.mjs`).
- [x] **Phase 2 : Design & Générateur HTML/CSS**
  - [x] Conception du composant visuel de fiche technique (style moderne marine / cartes A5).
  - [x] Répartition Recto (Identité/Réglementation) / Verso (Terrain/Tactiques).
  - [x] Intégration des jauges d'activité mensuelle thermique (12 mois) et badges réglementaires.
  - [x] Feuille de style d'impression `@media print` calibrée au millimètre pour A4 paysage duplex.
  - [x] Moteur d'imposition automatique par paire avec inversion horizontale au verso.
  - [x] Viewer interactif avec retournement 3D (`🔄 Tourner la fiche`), recherche instantanée et filtres.
  - [x] Script de compilation (`scripts/build-site.mjs`) et serveur local (`scripts/serve.mjs`).
