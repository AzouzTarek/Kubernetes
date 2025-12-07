# Utiliser l'image de base Nginx
FROM nginx:alpine



RUN rm /etc/nginx/conf.d/default.conf
# Copier le fichier de configuration nginx personnalisé
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 5000 pour l'API Gateway
EXPOSE 5000

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
