FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
