#!/bin/bash
# Build and push image
# docker build -t azouztarek/azouztarek/backend:v1
# docker push azouztarek/azouztarek/backend:v1

# --- Configuration du script ---
set -euo pipefail
# -e : stoppe le script en cas d'erreur
# -u : stoppe si une variable non définie est utilisée
# -o pipefail : capture les erreurs même dans les pipes

# Couleurs pour lisibilité
RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
RESET="\e[0m"

# Gestion des erreurs
trap 'echo -e "${RED}❌ Erreur à la ligne $LINENO. Exécution stoppée.${RESET}"' ERR

# --- Déploiement Kubernetes automatique ---
echo -e "${YELLOW}➡️ Vérification du cluster K3s...${RESET}"
kubectl get nodes || { echo -e "${RED}Impossible d’obtenir la liste des nœuds.${RESET}"; exit 1; }

echo -e "${YELLOW}➡️ Création de l’espace de noms 'step-2'...${RESET}"
kubectl apply -f ../k8s/namespace.yaml

echo -e "${YELLOW}➡️ Application des ConfigMap et Secrets...${RESET}"
kubectl apply -f ../k8s/configmap.yaml
kubectl apply -f ../k8s/secret.yaml

echo -e "${YELLOW}➡️ Déploiement de la base de données MongoDB...${RESET}"
kubectl apply -f ../k8s/db-deployment.yaml
kubectl apply -f ../k8s/db-service.yaml

echo -e "${YELLOW}➡️ Déploiement de l’application web...${RESET}"
kubectl apply -f ../k8s/backend-deployment.yaml
kubectl apply -f ../k8s/backend-service.yaml

echo -e "${YELLOW}➡️ Vérification du statut des Pods...${RESET}"
kubectl get pods -n step-2

echo -e "${YELLOW}➡️ Ressources déployées :${RESET}"
kubectl get all -n step-2

echo -e "${GREEN}✅ Déploiement terminé avec succès !${RESET}"

