# Front/Dockerfile
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia as dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código fonte
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# O comando final será sobrescrito pelo docker-compose, mas deixamos um padrão aqui
CMD ["npm", "run", "dev", "--", "--host"]