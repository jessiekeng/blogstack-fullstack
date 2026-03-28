# Use the Node.js version matching your package.json
FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying package.json AND package-lock.json
COPY package*.json ./

# Install only production dependencies for a smaller image
RUN npm ci --only=production

# Bundle app source
COPY . .

# Your app binds to port 3003
EXPOSE 3003

# Run the application
CMD [ "npm", "start" ]