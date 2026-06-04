# =============================================================================
# Dockerfile — Backend container imaji
# Node 20 Alpine; npm install + kaynak kod. Port 4000 expose edilir.
# docker compose ile postgres'e baglanarak calisir.
# =============================================================================
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]
