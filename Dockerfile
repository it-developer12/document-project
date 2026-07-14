FROM node:20.20.2

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
EXPOSE 3000

# CMD ["npm", "run", "dev"]