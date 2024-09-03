FROM node:alpine3.20

# Install Node.js
RUN apk add --no-cache python3 make build-base

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY ./src /app/src
COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./abi /app/abi

# Install any needed packages specified in package.json
RUN npm install

EXPOSE 8000

# Run the application
CMD ["node", "src/main/main.js"]