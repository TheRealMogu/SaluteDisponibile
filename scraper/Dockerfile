# Immagine ufficiale Playwright — include Chromium, Firefox, WebKit preinstallati
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
