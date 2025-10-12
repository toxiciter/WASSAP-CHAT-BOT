FROM node:18-slim

# Puppeteer এর জন্য Chrome dependency ইনস্টল
RUN apt-get update && apt-get install -y \
    chromium \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libdrm2 \
    libgbm1 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# package.json ইনস্টল
COPY package*.json ./
RUN npm install

# অ্যাপের কোড কপি করা
COPY . .

# Puppeteer যেন Chromium-এর path চিনে
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
