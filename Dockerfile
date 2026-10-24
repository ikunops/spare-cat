FROM node:24-bookworm-slim

WORKDIR /app
ENV HOST=0.0.0.0 PORT=4173
COPY . .

EXPOSE 4173
CMD ["node", "server/app.js"]
