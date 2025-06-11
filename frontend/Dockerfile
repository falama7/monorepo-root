FROM node:16-alpine

WORKDIR /app

# Copier uniquement package.json d'abord
COPY package.json ./

# Installer les dépendances (cela régénérera le lock file)
RUN npm install

# Copier le reste du code
COPY . ./

# Exposer le port
EXPOSE 3000

CMD ["npm", "start"]