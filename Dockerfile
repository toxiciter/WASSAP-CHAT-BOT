# Dockerfile
FROM node:18-slim

# Install dependencies required by Chromium / Puppeteer
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    wget \
    xdg-utils \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgobject-2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libxss1 \
    libxtst6 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# copy package files first for better caching
COPY package*.json ./
RUN npm install --production

COPY . .

# If you need to allow chromium to run with no-sandbox
ENV PUPPETEER_EXECUTABLE_PATH=""
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

CMD ["node", "bot.js"]
