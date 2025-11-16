FROM node:20-alpine

# Instalar dependências do sistema (LibreOffice para conversão de documentos)
RUN apk add --no-cache libreoffice

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 4000

# Comando de desenvolvimento (usa tsx watch para hot reload)
CMD ["npm", "run", "dev"]