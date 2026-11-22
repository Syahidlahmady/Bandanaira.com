FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5175

CMD ["sh", "-c", "npm run build && npm run preview -- --host 0.0.0.0 --port 5175"]
