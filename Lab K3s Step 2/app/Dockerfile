# Étape 1 : Image de base
FROM node:22-alpine

# Étape 2 : Répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers de dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install --production

# Étape 5 : Copier le reste du code
COPY . .

# Étape 6 : Exposer le port
EXPOSE 5000

# Étape 7 : Lancer le serveur
CMD ["npm", "start"]
