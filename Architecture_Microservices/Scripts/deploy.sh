#!/usr/bin/env bash
# ==========================
# 🚀 Deployment Script (Multi-Module: PostgreSQL + Services + Apps)
# ==========================

set -euo pipefail

# ---------- Couleurs ----------
RED="\e[31m"; GREEN="\e[32m"; YELLOW="\e[33m"; BLUE="\e[34m"; RESET="\e[0m"

# ---------- Paramètres ----------
NAMESPACE="${NAMESPACE:-fullstack}"         # Peut être surchargé: NAMESPACE=dev ./deploy.sh
K8S_DIR="${K8S_DIR:-../K8s}"                     # Racine des manifests
KUBECTL="${KUBECTL:-kubectl}"

# ---------- Utilitaires ----------
log()   { echo -e "${YELLOW}➡️ $*${RESET}"; }
ok()    { echo -e "${GREEN}✅ $*${RESET}"; }
err()   { echo -e "${RED}❌ $*${RESET}"; }
info()  { echo -e "${BLUE}ℹ️  $*${RESET}"; }

trap 'err "Erreur à la ligne $LINENO. Exécution stoppée."' ERR

# Vérifie que les fichiers existent
require_file() {
  local f="$1"
  [[ -f "$f" ]] || { err "Fichier manquant: $f"; exit 1; }
}

wait_statefulset_ready() {
  local ss="$1"; local ns="$2"
  log "🕓 Attente du StatefulSet '$ss'…"
  ${KUBECTL} rollout status statefulset/"$ss" -n "$ns" --timeout=180s
  ok "StatefulSet '$ss' prêt."
}

wait_deployment_ready() {
  local deploy="$1"; local ns="$2"
  log "🕓 Attente du Deployment '$deploy'…"
  ${KUBECTL} rollout status deployment/"$deploy" -n "$ns" --timeout=180s
  ok "Deployment '$deploy' prêt."
}

apply_or_die() {
  local file="$1"
  require_file "$file"
  ${KUBECTL} apply -f "$file" || { err "Échec apply: $file"; exit 1; }
}

# ---------- Pré-checks ----------
log "Vérification du cluster Kubernetes…"
${KUBECTL} get nodes >/dev/null || { err "Cluster inaccessible."; exit 1; }

# Contexte (optionnel)
CURRENT_CONTEXT="$(${KUBECTL} config current-context || echo 'N/A')"
info "Contexte courant: ${CURRENT_CONTEXT}"

# ---------- Namespace ----------
log "Création/mise à jour de l’espace de noms '${NAMESPACE}'…"
apply_or_die "${K8S_DIR}/namespace.yml"

# ---------- PostgreSQL ----------

log "Application des ConfigMap/Secrets PostgreSQL…"
apply_or_die "${K8S_DIR}/PostgreSQL/postgres-config.yml"
apply_or_die "${K8S_DIR}/PostgreSQL/postgres-secret.yml"

log "Déploiement PostgreSQL (Headless + StatefulSet)…"
apply_or_die "${K8S_DIR}/PostgreSQL/postgres-headless.yml"
apply_or_die "${K8S_DIR}/PostgreSQL/postgres-statefulset.yml"

wait_statefulset_ready "postgres" "${NAMESPACE}"



# ---------- Book Service ----------
log "Déploiement du service Book…"
apply_or_die "${K8S_DIR}/Book-service/book-deployment.yml"
apply_or_die "${K8S_DIR}/Book-service/book-service.yml"
wait_deployment_ready "book-service" "${NAMESPACE}"

# ---------- Order Service ----------
log "Déploiement du service Order…"
apply_or_die "${K8S_DIR}/Order-service/order-config.yml"
apply_or_die "${K8S_DIR}/Order-service/order-deployment.yml"
apply_or_die "${K8S_DIR}/Order-service/order-service.yml"
wait_deployment_ready "order-service" "${NAMESPACE}"

# ---------- Nginx (API Gateway) ----------
log "Déploiement de l'API Gateway (Nginx)…"
apply_or_die "${K8S_DIR}/Nginx/nginx-conf.yml"
apply_or_die "${K8S_DIR}/Nginx/gateway-conf.yml"
apply_or_die "${K8S_DIR}/Nginx/nginx-deployment.yml"
apply_or_die "${K8S_DIR}/Nginx/nginx-service.yml"
wait_deployment_ready "api-gateway" "${NAMESPACE}"

# ---------- Frontend ----------
log "Déploiement de l'application Frontend…"
apply_or_die "${K8S_DIR}/front/frontend-config.yml"
apply_or_die "${K8S_DIR}/front/frontend-deployment.yml"
apply_or_die "${K8S_DIR}/front/frontend-service.yml"
wait_deployment_ready "frontend" "${NAMESPACE}"



# ---------- Vérifications finales ----------
log "Statut des Pods…"
${KUBECTL} get pods -n "${NAMESPACE}"

log "Ressources déployées dans '${NAMESPACE}' :"
${KUBECTL} get all -n "${NAMESPACE}"

log "Volumes persistants (PVC) :"
${KUBECTL} get pvc -n "${NAMESPACE}" || info "Aucun PVC détecté."

# ---------- Infos Services ----------
info "Points d’accès des Services :"
${KUBECTL} get svc -n "${NAMESPACE}"

ok "Déploiement terminé avec succès !"
