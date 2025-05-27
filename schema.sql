CREATE DATABASE IF NOT EXISTS financeiro;
USE financeiro;

CREATE TABLE categorias(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nome VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id_user)
);

CREATE TABLE purchases(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    categoria_id INT,
    amount DECIMAL(10,2),
    descricao VARCHAR(255),
    purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id_user),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria)
    )