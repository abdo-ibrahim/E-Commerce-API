const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

// Collect YAML files
const docsGlob = path.join(__dirname, "../swagger/**/*.{js,yaml,yml}").replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "E-commerce API", version: "1.0.0" },
    servers: [{ url: "http://localhost:5000" }],
    components: {},
  },
  apis: [docsGlob],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};

module.exports = setupSwagger;
