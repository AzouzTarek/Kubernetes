#!/bin/bash
# ==========================
# 🚀 Deployment Script (StatefulSet version)
# ==========================

# --- Configuration stricte ---
set -euo pipefail
trap 'echo -e "${RED}❌ Erreur à la ligne $LINENO. Exécution stoppée.${RESET}"' ERR

# --- Couleurs ---
RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
RESET="\e[0m"

# --- Vérification du cluster ---
echo -e "${YELLOW}➡️ Vérification du cluster Kubernetes...${RESET}"
kubectl get nodes || { echo -e "${RED}❌ Cluster inaccessible.${RESET}"; exit 1; }

# --- Namespace ---
echo -e "${YELLOW}➡️ Création de l’espace de noms 'step-3'...${RESET}"
kubectl apply -f ../k8s/namespace.yaml

# --- ConfigMap et Secret ---
echo -e "${YELLOW}➡️ Application des ConfigMap et Secrets...${RESET}"
kubectl apply -f ../k8s/configmap.yaml
kubectl apply -f ../k8s/secret.yaml

# --- MongoDB : StatefulSet + Services ---
echo -e "${YELLOW}➡️ Déploiement de la base MongoDB (StatefulSet)...${RESET}"

# ✅ Plus besoin de PV/PVC manuels (volumeClaimTemplates s’en charge)
kubectl apply -f ../k8s/db-headless-service.yaml
kubectl apply -f ../k8s/db-service.yaml
kubectl apply -f ../k8s/db-statefulset.yaml

echo -e "${YELLOW}🕓 Attente que le StatefulSet 'mongo' soit prêt...${RESET}"
kubectl rollout status statefulset/mongo -n step-4

# --- Application web ---
echo -e "${YELLOW}➡️ Déploiement de l’application backend...${RESET}"
kubectl apply -f ../k8s/backend-deployment.yaml
kubectl apply -f ../k8s/backend-service.yaml

# --- Vérification finale ---
echo -e "${YELLOW}➡️ Vérification du statut des Pods...${RESET}"
kubectl get pods -n step-4

echo -e "${YELLOW}➡️ Ressources déployées dans 'step-3':${RESET}"
kubectl get all -n step-4

# --- Informations utiles ---
echo -e "${YELLOW}➡️ Volumes persistants créés:${RESET}"
kubectl get pvc -n step-4

echo -e "${GREEN}✅ Déploiement terminé avec succès !${RESET}"
