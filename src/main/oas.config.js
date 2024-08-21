const swaggerUi = require('swagger-ui-express');
const { apiReference } = require('@scalar/express-api-reference');

const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'api');

const mergedSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Signing API',
        version: '1.0.0',
    },
    paths: {},
    tags: [
        {
            name: 'Chain Service',
            description: 'Endpoints related to blockchain chain services onboarding and update.'
        },
        {
            name: 'Gnosis Service',
            description: 'Endpoints related to Gnosis services, including execTransaction, and signature payload generation.'
        },
        {
            name: 'Key Service',
            description: 'Endpoints related to key management services, including generating child keys from master seed.'
        },
        {
            name: 'Transaction Service',
            description: 'Endpoints related to transaction services, generic signing for chains using EIP155.'
        }
    ],
};

// TODO Can make this recursive to read all files in the directory
const readAndMergeJsonFiles = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    const specs = files
        .filter(file => file.endsWith('doc.js'))
        .forEach(file => {
            const filePath = path.join(dirPath, file);
            const spec = require(filePath);

            Object.keys(spec).forEach((key) => {
                if (spec[key].paths) {
                    mergedSpec.paths = { ...mergedSpec.paths, ...spec[key].paths };
                }
            });
        })
    return specs;
};

module.exports = (app) => {
    readAndMergeJsonFiles(dirPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(mergedSpec));
    app.use('/docs-scalar', apiReference({ spec: {content: mergedSpec}, theme: 'dark' }));
};