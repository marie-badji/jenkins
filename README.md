# todo-front — Pipeline CI/CD avec GitLab

> Application React de gestion de tâches déployée via une pipeline CI/CD complète sur GitLab.

---

## Sommaire

- [Présentation du projet](#présentation-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Structure du projet](#structure-du-projet)
- [Étapes de mise en place](#étapes-de-mise-en-place)
- [Pipeline CI/CD](#pipeline-cicd)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer le projet en local](#lancer-le-projet-en-local)
- [Auteur](#auteur)

---

## Présentation du projet

Ce projet est une application **React** de gestion de tâches (Todo App). Il a été conçu dans le cadre d'un TP DevOps pour mettre en place une **pipeline CI/CD complète** avec GitLab CI.

L'objectif principal est la mise en place de l'automatisation du build, des tests et du déploiement via **GitLab CI/CD** et **Docker Hub**.

---

## Technologies utilisées

| Technologie | Rôle |
|-------------|------|
| **React** | Framework front-end |
| **npm** | Gestionnaire de paquets |
| **GitLab CI/CD** | Pipeline d'intégration et de déploiement continus |
| **Docker** | Conteneurisation de l'application |
| **Docker Hub** | Registry pour stocker l'image Docker |
| **Nginx** | Serveur web pour servir l'application en production |

---

## Structure du projet

```
todo-front/
├── .gitlab-ci.yml      # Configuration de la pipeline CI/CD
├── Dockerfile          # Image Docker multi-stage (build + serve)
├── nginx.conf          # Configuration du serveur Nginx
├── public/             # Fichiers statiques publics
├── src/                # Code source React
│   ├── App.js
│   ├── App.test.js
│   └── index.js
├── package.json        # Dépendances npm
└── README.md           # Documentation du projet
```

## Pipeline CI/CD

La pipeline est définie dans le fichier `.gitlab-ci.yml` et se compose de **3 stages**.

```
push → [build] → [test] → [deploy ▶ manuel]
```

### Stage 1 — Build
- Installe les dépendances avec `npm install`
- Compile l'application React avec `npm run build`
- Sauvegarde le dossier `artifact/` pour les stages suivants

### Stage 2 — Test
- Exécute les tests unitaires avec `npm test`
- Configuré en `allow_failure: true` : ne bloque pas le pipeline
- Timeout fixé à **15 minutes**

### Stage 3 — Deploy (manuel)
- Build une image Docker via le `Dockerfile`
- Se connecte à **Docker Hub** avec les variables sécurisées
- Pousse l'image : `DOCKER_HUB_USER/todo-front:latest`
- Déclenchement **manuel** via le bouton ▶️ dans GitLab

### Fichier `.gitlab-ci.yml`

```yaml
stages:
  - build
  - test
  - deploy

image: node:18-alpine

build job:
  stage: build
  cache:
    paths:
      - node_modules/
  script:
    - npm install --force
    - npm run build
    - mkdir -p artifact
    - mv build/* artifact/
  artifacts:
    paths:
      - artifact/

unit test job:
  stage: test
  timeout: 15m
  script:
    - npm install --force
    - npm test -- --watchAll=false --passWithNoTests
  allow_failure: true

deploy job:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_HUB_USER/todo-front:latest .
    - docker login -u $DOCKER_HUB_USER -p $DOCKER_HUB_TOKEN
    - docker push $DOCKER_HUB_USER/todo-front:latest
  when: manual
```

---

## Dockerfile

Image **multi-stage** pour une image finale légère :

```dockerfile
# Stage 1 : Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build

# Stage 2 : Serve avec Nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
### Créer un token Docker Hub

Avant de configurer GitLab, il faut créer un token d'accès sur **Docker Hub** avec les permissions **Read & Write** pour permettre à GitLab de pusher les images.

![Création du token Docker Hub](captures/creation_du_docker_token.png)


---
## Variables d'environnement

| Variable | Description | Visibilité |
|----------|-------------|------------|
| `DOCKER_HUB_USER` | Pseudo Docker Hub | Masked |
| `DOCKER_HUB_TOKEN` | Token d'accès Docker Hub (Read & Write) | Masked and hidden |

---

### Ajouter les variables CI/CD dans GitLab

Les variables `DOCKER_HUB_USER` et `DOCKER_HUB_TOKEN` sont ajoutées dans **Settings → CI/CD → Variables** pour sécuriser les credentials Docker Hub.

**Variable DOCKER_HUB_USER :**

![Variable DOCKER_HUB_USER](captures/variables1.png)

**Variable DOCKER_HUB_TOKEN :**

![Variable DOCKER_HUB_TOKEN](captures/variables2.png)

---

### Initialiser le dépôt Git et faire le premier commit

Initialisation du dépôt Git local, ajout de tous les fichiers et création du premier commit.

![git init et git add](captures/git1.png)

---

### Lier le dépôt GitLab et pusher

Configuration du remote GitLab avec le token d'accès inclus dans l'URL, puis push du code sur la branche `main`.

![git remote set-url et git push](captures/git2.png)

---

### Étape 5 — Pipeline CI/CD exécutée avec succès

La pipeline tourne automatiquement à chaque push. Les 3 stages sont visibles et passent au vert.

![Vue des pipelines](captures/pipelines.png)

---

### Étape 6 — Détail des jobs

Chaque job est exécuté dans l'ordre : `build job` → `unit test job` → `deploy job` (manuel).

![Détail des jobs](captures/job.png)

---


## Lancer le projet en local

```bash
# Cloner le projet
git clone https://gitlab.com/mary_bdj/gitlab_ci_m2gl.git
cd gitlab_ci_m2gl

# Installer les dépendances
npm install

# Lancer en mode développement
npm start
```

### Avec Docker

```bash
docker build -t todo-front .
docker run -p 80:80 todo-front
```

---

## Auteur

**Marie BADJI** — M2GL DevOps  
Dépôt GitLab : [gitlab.com/mary_bdj/gitlab_ci_m2gl](https://gitlab.com/mary_bdj/gitlab_ci_m2gl)