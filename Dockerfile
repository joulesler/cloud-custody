FROM node:20.10-alpine3.19

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY ./src /app/src
COPY ./test /app/test
COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./abi /app/abi

# Install any needed packages specified in package.json
RUN npm install
RUN npm install -g pm2 && npm install

# Define build arguments
ARG PORT=8080
ARG DB_HOST=172.17.0.1
ARG DB_PORT=5432
ARG DB_USER=admin
ARG DB_PASSWORD=password
# Default to public Database
ARG DB_DATABASE=cloud_custody
ARG PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtoZtGoL0idEzqMIZhlYm\nCTYqDkrD1DrgMYjgHC4FC7l9MjLX7cArArcPt/vg1ZDeyLgBXEEjg8VqgTH9Arit\nHiJtMbU0vwA22zq8APkycUe3DI5WXaLpNnc5Vn6Uxh2C5UGLlsm17CXrTUj+70lQ\nYgmalkUZEBGvkzYxdRz0R9wFAYDJKZZWdGWs7NDM8thIfKjwLIgswJ26QpTy7zNS\ngWsabOdtbVmJbqH40oiU8sExgeMtHQ7G67W8wU2EIscrQyWTLc5CVz2hT12FQ+U+\niNgWgd+RNsEYH9TiDyiHOAN8wfDDoj2oqHAoS0ERL9rnfn8GzPT78vP/5vC2Q1Dg\n9wIDAQAB\n-----END PUBLIC KEY-----\n"
ARG PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2hm0agvSJ0TOo\nwhmGViYJNioOSsPUOuAxiOAcLgULuX0yMtftwCsCtw+3++DVkN7IuAFcQSODxWqB\nMf0CuK0eIm0xtTS/ADbbOrwA+TJxR7cMjlZdouk2dzlWfpTGHYLlQYuWybXsJetN\nSP7vSVBiCZqWRRkQEa+TNjF1HPRH3AUBgMkpllZ0Zazs0Mzy2Eh8qPAsiCzAnbpC\nlPLvM1KBaxps521tWYluofjSiJTywTGB4y0dDsbrtbzBTYQixytDJZMtzkJXPaFP\nXYVD5T6I2BaB35E2wRgf1OIPKIc4A3zB8MOiPaiocChLQREv2ud+fwbM9Pvy8//m\n8LZDUOD3AgMBAAECggEACeh1SJxAH82/MF43Mykwr9Q2bnJnNMCI+3WbxMhIErox\nZyzb02TKcOots5e8BH9mRslGR9oyQAILpVn24H5GV32KCTugtgkgRoefrzstHnmL\nruYjHvNy+XBdKKpiZRT56rTf7yyht0ShdfTFHKX1EDY5QAaPw0in0wlEEgejOitK\nBnFXfEhnGijQ8T5lGPgtOp2Ue2fNR+M2WYNcFiwpER3HzN9s+yL1zqcxC0SAVQ8e\nLhS9dkN0/JSEBX1Fc0PpGNyLdOoCw0vfaAk0W/0YbM6KuZ2eMEB45mMYLoCVazdo\nV/OVG7sYxSXMEZL0WUIcKZY9XYvcGnJZg6skzElnEQKBgQD/cMhoumNHl5kygAqO\nxF5EIMNzhCgS+7JG4cbOzSIS6QiDV4ed3dYvT+sL0dseeQQTRGsxjSdOCxCCgNkG\n/dNejryfqfAWgfUCb1vUj4Y08BW63OtJ+RFqFPJ0pGi9A4nWalVVH7Bs+l25TT71\na9feTX0ZMtK0na7ISyUzuA/QmwKBgQC27MMUcK28wZaCXjz/4NxMqUhcPKvpoGy8\npQs1JjD3IMqX+t5wJlgwOCoRG/mXwKJrgJi/x4z8LU9ke9EKh7oP4BdXnBm+tmAT\nqfYFNgyvn1NuGkWCvKOm1SvNGqzUiJemCVo9c3UZP+7gw/eboWPrS0im23cGMhbt\nEryWt7Xw1QKBgQDbgxFGJn5wpI9rPWtVOt0DUOCFoZlKju+qSBWv28qfU5EURaDu\nghewus3zb1kM+9QLtq0jfPi88XcznwRiJLiCtsjTsJb40J87g3T32orrbTJPTdAI\n1rgnYG7m2+6CF8tY7jH8n+neDN2EAyTKhO2SRSbvA6Tcv/DWgPUsV82HZwKBgAe7\nRhuND6rUu9nSxd1C0czjss1DOzjqsO3gQ/MBJDytxCJcVh6DYGLZXN3QQuJpH/RP\nQSWJ96mI+LwUh6dcST72h8YKMQRgjPsHygA6YprhrxMORTXbZ0db5zgKEpgBFffM\nmWXThXWFwED7x3FqhuChE/cJe6RlZZarnhD4vtXpAoGACEp/Ds/GxXlJTg9FLQ0g\n3e0oO5EKD1oQSGqeYF/l80LYMgBxLvFs1DSxF0E4f3gmAuvwkz5cC6yycJ+4/faD\nymfPfUG58FAx8o7Jqtzg26J2XhmTyeBDjKjwZGjyuZ2qcfGHJF7E5mkLUdH+dzWD\nAFwSxMvMON2Z0l5pMyMeN5o=\n-----END PRIVATE KEY-----\n"

ARG aws_access_key_id
ARG aws_secret_access_key

ARG REQUEST_QUEUE_NAME="request"
ARG RESPONSE_QUEUE_NAME="response"
ARG RABBITMQ_URL=amqp://guest:guest@172.17.0.1:5672

# USE THIS TO ENABLE REST TO MQ CONVERTER
ENV NODE_ENV=test

# Use the build arguments as environment variables
ENV PORT=$PORT
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DB_DATABASE
ENV PUBLIC_KEY=$PUBLIC_KEY
ENV PRIVATE_KEY=$PRIVATE_KEY

ENV AWS_ACCESS_KEY_ID=$aws_access_key_id
ENV AWS_SECRET_ACCESS_KEY=$aws_secret_access_key

ENV REQUEST_QUEUE_NAME=$REQUEST_QUEUE_NAME
ENV RESPONSE_QUEUE_NAME=$RESPONSE_QUEUE_NAME
ENV RABBITMQ_URL=$RABBITMQ_URL

EXPOSE $PORT

# Run the application
CMD ["pm2-runtime", "start", "src/main/main.js", "--name", "app"]