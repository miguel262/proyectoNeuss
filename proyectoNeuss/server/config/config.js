process.env.PORT = process.env.PORT || 3050;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

// Base de Datos
process.env.MYSQL_URL = process.env.MYSQL_URL || "localhost";
process.env.MYSQL_USERNAME = process.env.MYSQL_USERNAME || "admin";
process.env.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "admin";
process.env.MYSQL_DATABASE = "neuss";
process.env.MYSQL_PORT = process.env.MYSQL_PORT || 3306;

// bcrypt

saltRounds = 10;

// Token
process.env.EXPIRATION_TOKEN = "24h";
process.env.SEED = process.env.SEED || "dev-seed";