const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillSpark API',
      version: '1.0.0',
      description: 'API documentation for SkillSpark Learning Platform',
    },
    servers: [{ url: 'http://localhost:5000' }]
  },
  apis: ['./routes/*.js'], // Path to your route files with JSDoc comments
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
