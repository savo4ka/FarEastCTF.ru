# Используем официальный Node.js образ версии 20.13.1
FROM node:12.22.12

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (или pnpm-lock.yaml/yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

RUN npm run build

# Открываем порт (если требуется, например 3000)
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
