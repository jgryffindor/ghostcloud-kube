# Use Node.js as the base image
FROM node:18.17.1-bullseye

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

ENV APP_ENV="development"
ENV APP_NAME="Ghostcloud Kube"
ENV APP_URL="http://localhost:9001"
ENV APP_PORT="3000"
ENV DEBUG="true"
ENV APP_NETWORK="/api"

# Start the server using the production build
CMD [ "node", "dist/main.js" ]