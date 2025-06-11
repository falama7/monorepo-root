FROM node:16-alpine
WORKDIR /app

# Copier uniquement package.json
COPY package.json ./

# Installer les dépendances (incluant react-scripts) sans lockfile
RUN npm install

# Copier le reste du code
COPY . ./

CMD ["npm","start"]