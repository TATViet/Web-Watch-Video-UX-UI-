CREATE DATABASE owlloop;

\c owlloop;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  display_name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
