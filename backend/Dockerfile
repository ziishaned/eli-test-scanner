FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./

COPY backend/package.json ./backend/

RUN yarn install --frozen-lockfile

COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 3000

CMD ["yarn", "dev"]