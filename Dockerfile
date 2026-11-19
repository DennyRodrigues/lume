FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
COPY web/package*.json web/
COPY server/prisma server/prisma
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy && npm run start --workspace server"]
