import swaggerJsdoc from "swagger-jsdoc";

const jsonBody = (required, properties) => ({
  required: true,
  content: { "application/json": { schema: { type: "object", required, properties } } },
});

const transactionProperties = {
  title: { type: "string", example: "Kharashka korontada" },
  amount: { type: "number", example: 50 },
  type: { type: "string", enum: ["income", "expense"], example: "expense" },
  category: { type: "string", example: "Biilasha" },
  date: { type: "string", format: "date", example: "2026-09-14" },
};

const protectedRoute = (summary, tags = ["Transactions"]) => ({
  tags, summary, security: [{ bearerAuth: [] }],
  responses: { 200: { description: "Success" }, 401: { description: "Authentication required" } },
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Personal Finance Tracker API", version: "1.0.0", description: "Personal finance API" },
    servers: [
      {
        url:
          process.env.RENDER_EXTERNAL_URL ||
          process.env.API_URL ||
          "http://localhost:3000",
      },
    ],
    components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
    paths: {
      "/auth/register": { post: { tags: ["Auth"], summary: "Register a user", requestBody: jsonBody(["name", "email", "password"], { name: { type: "string", example: "Ali Hassan" }, email: { type: "string", format: "email", example: "ali@example.com" }, password: { type: "string", format: "password", example: "Password123" } }), responses: { 201: { description: "Account created" }, 409: { description: "Email already registered" } } } },
      "/auth/login": { post: { tags: ["Auth"], summary: "Login a user", requestBody: jsonBody(["email", "password"], { email: { type: "string", format: "email", example: "ali@example.com" }, password: { type: "string", format: "password", example: "Password123" } }), responses: { 200: { description: "Login successful" }, 401: { description: "Invalid credentials" } } } },
      "/auth/profile": { get: protectedRoute("Get profile", ["Auth"]) },
      "/auth/profile-picture": { post: { ...protectedRoute("Upload profile picture", ["Upload"]), requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["profilePicture"], properties: { profilePicture: { type: "string", format: "binary" } } } } } } } },
      "/transactions": { get: protectedRoute("List transactions"), post: { ...protectedRoute("Create transaction"), requestBody: jsonBody(["title", "amount", "type", "category"], transactionProperties) } },
      "/transactions/monthly-summary": { get: protectedRoute("Get monthly summary") },
      "/transactions/{id}": { put: { ...protectedRoute("Update transaction"), parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: jsonBody([], transactionProperties) }, delete: { ...protectedRoute("Delete transaction"), parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }] } },
      "/categories": { get: protectedRoute("List categories", ["Categories"]) },
      "/admin/overview": { get: protectedRoute("Get admin overview", ["Admin"]) },
    },
  },
  apis: [],
};

export default swaggerJsdoc(options);
