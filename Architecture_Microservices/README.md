# 🚀 Déploiement Fullstack Microservices avec Kubernetes & Nginx API Gateway

Ce projet implémente une **architecture microservices complète déployée sur Kubernetes**, comprenant :

- ✅ PostgreSQL (StatefulSet)
- ✅ Book Service
- ✅ Order Service
- ✅ API Gateway Nginx (Reverse Proxy)
- ✅ Frontend dynamique avec Runtime Configuration
- ✅ Déploiement automatisé via script Bash

Le déploiement est entièrement orchestré par le script `deploy.sh`.

---

## 🧱 Architecture Générale
```
[ Frontend (React) ]
        |
        | (NodePort)
        v
[ NGINX API GATEWAY ]
        |
        |----> /api/books ---> [ Book Service ]
        |
        |----> /api/orders --> [ Order Service ]
        |
        v
    [ PostgreSQL ]
```

---

## 📁 Structure du Projet
```
.
├── deploy.sh
└── K8s/
    ├── namespace.yml
    ├── PostgreSQL/
    │   ├── postgres-config.yml
    │   ├── postgres-secret.yml
    │   ├── postgres-headless.yml
    │   └── postgres-statefulset.yml
    ├── Book-service/
    │   ├── book-deployment.yml
    │   └── book-service.yml
    ├── Order-service/
    │   ├── order-config.yml
    │   ├── order-deployment.yml
    │   └── order-service.yml
    ├── Nginx/
    │   ├── nginx-conf.yml
    │   ├── gateway-conf.yml
    │   ├── nginx-deployment.yml
    │   └── nginx-service.yml
    └── front/
        ├── frontend-config.yml
        ├── frontend-deployment.yml
        └── frontend-service.yml
```
## ⚙️ Prérequis

- Kubernetes fonctionnel (Minikube, K3s, AKS, EKS, etc.)
- `kubectl` installé et configuré
- Docker installé
- Bash (Linux, macOS ou WSL)

Vérification :

```bash
kubectl get nodes
```

### ▶️ Déploiement Automatique

1️⃣ Donner les droits au script

```bash
chmod +x deploy.sh
```

2️⃣ Lancer le déploiement

```bash
./deploy.sh
```

Variables optionnelles :

```bash
NAMESPACE=fullstack
K8S_DIR=../K8s
```

---

## 🧠 Fonctionnement du Script de Déploiement

Le script exécute automatiquement les étapes suivantes :

- Vérification de l’accès au cluster Kubernetes
- Création du namespace fullstack
- Déploiement de PostgreSQL :
  - ConfigMap
  - Secret
  - Service Headless
  - StatefulSet
- Déploiement du Book Service
- Déploiement du Order Service + ConfigMap
- Déploiement de l’API Gateway Nginx :
  - nginx-conf
  - gateway-conf
  - Deployment
  - Service
- Déploiement du Frontend
- Vérification finale :
  - Pods
  - Services
  - PVC

---

## ⚙️ Gestion Avancée de Nginx avec ConfigMaps

### 1️⃣ Frontend Runtime Configuration

```yaml
frontend-runtime-config
```

Contient un fichier config.js injecté côté navigateur :

```js
window.__RUNTIME_CONFIG__ = {
  NGINX_API: "http://192.168.100.10:30188"
};
```

✅ Le Frontend utilise dynamiquement l’URL de l’API
✅ Une seule image Docker fonctionne pour tous les environnements
✅ Aucune recompilation après modification de configuration

### 2️⃣ Définition Dynamique des Microservices

```yaml
nginx-conf
```

Contient :

```nginx
set $book_service_url  http://book-service:5001;
set $order_service_url http://order-service:5002;
```

✅ Les URLs ne sont jamais codées en dur
✅ Un seul point de modification
✅ Scalable et maintenable

### 3️⃣ API Gateway Nginx (Reverse Proxy)

```yaml
gateway-conf
```

Fonctions principales :

- Routage /api/books → Book Service
- Routage /api/orders → Order Service
- Gestion CORS centralisée
- Healthcheck /healthz
- Timeouts optimisés

✅ Toute la communication Frontend → Backend passe par Nginx
✅ Aucun accès direct aux microservices

---

## ⚙️ Configuration des Autres Services

### PostgreSQL

ConfigMap :

```yaml
PG_PORT: "5432"
PG_DB_NAME: "bookstore_db"
PG_SSLMODE: "disable"
```

Secret :

```yaml
POSTGRES_USER
POSTGRES_PASSWORD
```

✅ Sécurité des identifiants via Secrets Kubernetes

### Order Service

```yaml
BOOK_SERVICE_URL: "http://book-service:5001"
```

✅ Communication dynamique inter-services
✅ Compatible autoscaling

---

## ✅ Vérification Après Déploiement

```bash
kubectl get pods -n fullstack
kubectl get svc -n fullstack
kubectl get pvc -n fullstack
```

---

## 🌐 Accès à l’Application

- Frontend : via NodePort
- API : via Nginx Gateway
- Microservices : accessibles uniquement via Nginx

---

## 🔐 Sécurité de l’Architecture

- Isolation via Namespace
- Secrets Kubernetes pour PostgreSQL
- API Gateway unique
- Aucun accès direct aux microservices
- CORS centralisé au niveau Nginx

---

## 🎯 Objectifs du Projet

- Microservices Cloud-Native
- API Gateway centralisée
- Frontend configurable dynamiquement
- PostgreSQL Statefull
- Déploiement DevOps automatisé

---

## ✅ Conclusion

Ce projet met en œuvre une architecture professionnelle Microservices + Kubernetes + Nginx API Gateway, avec :

- Configuration entièrement dynamique via ConfigMaps
- Sécurité via Secrets Kubernetes
- Déploiement automatisé, reproductible et scalable
- Séparation claire des responsabilités


