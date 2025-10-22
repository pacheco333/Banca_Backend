-- ============================================
-- BASE DE DATOS BANCA UNO
-- ============================================

DROP DATABASE IF EXISTS banca_uno;
CREATE DATABASE banca_uno CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banca_uno;

-- Tabla Clientes
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('CC', 'CE', 'TI', 'PA') NOT NULL,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    nombre_completo VARCHAR(200),
    genero ENUM('M', 'F', 'Otro') NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nacionalidad VARCHAR(50) DEFAULT 'Colombiana',
    estado_civil ENUM('Soltero', 'Casado', 'Unión Libre', 'Divorciado', 'Viudo') NOT NULL,
    profesion VARCHAR(100),
    ocupacion VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_documento (tipo_documento, numero_documento)
) ENGINE=InnoDB;

-- Tabla Contacto Personal
CREATE TABLE contacto_personal (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT UNIQUE,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    telefono VARCHAR(15),
    correo VARCHAR(100),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla Solicitudes de Apertura
CREATE TABLE solicitudes_apertura (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    tipo_cuenta ENUM('Ahorros', 'Corriente') DEFAULT 'Ahorros',
    estado ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Devuelta') DEFAULT 'Pendiente',
    comentario_director TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    INDEX idx_estado (estado),
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- Tabla Cuentas de Ahorro
CREATE TABLE cuentas_ahorro (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
    id_cliente INT NOT NULL,
    id_solicitud INT,
    saldo DECIMAL(15, 2) DEFAULT 0.00,
    estado_cuenta ENUM('Activa', 'Inactiva', 'Bloqueada', 'Cerrada') DEFAULT 'Activa',
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_apertura(id_solicitud),
    INDEX idx_numero_cuenta (numero_cuenta),
    INDEX idx_cliente_cuenta (id_cliente)
) ENGINE=InnoDB;

-- Tabla Transacciones
CREATE TABLE transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta INT NOT NULL,
    tipo_transaccion ENUM('Apertura', 'Depósito', 'Retiro', 'Transferencia') NOT NULL,
    tipo_deposito ENUM('Efectivo', 'Cheque') NULL,
    monto DECIMAL(15, 2) NOT NULL,
    codigo_cheque VARCHAR(50) NULL,
    numero_cheque VARCHAR(50) NULL,
    saldo_anterior DECIMAL(15, 2),
    saldo_nuevo DECIMAL(15, 2),
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta) REFERENCES cuentas_ahorro(id_cuenta),
    INDEX idx_cuenta_trans (id_cuenta)
) ENGINE=InnoDB;

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Clientes de prueba
INSERT INTO clientes (tipo_documento, numero_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, nombre_completo, genero, fecha_nacimiento, estado_civil, profesion, ocupacion) VALUES
('CC', '1012345678', 'Juan', 'Carlos', 'Pérez', 'Gómez', 'Juan Carlos Pérez Gómez', 'M', '1990-05-15', 'Soltero', 'Ingeniero de Sistemas', 'Desarrollador'),
('CC', '1023456789', 'Laura', 'Marcela', 'Ramírez', 'López', 'Laura Marcela Ramírez López', 'F', '1985-08-22', 'Casado', 'Contador', 'Contadora'),
('CE', '234567890', 'Michael', NULL, 'Smith', 'Johnson', 'Michael Smith Johnson', 'M', '1988-12-10', 'Soltero', 'Profesor', 'Docente'),
('CC', '1034567890', 'Andrea', 'Carolina', 'Martínez', 'Vargas', 'Andrea Carolina Martínez Vargas', 'F', '1995-03-30', 'Unión Libre', 'Administradora', 'Gerente');

-- Contactos
INSERT INTO contacto_personal (id_cliente, direccion, ciudad, telefono, correo) VALUES
(1, 'Calle 100 # 20-30', 'Bogotá', '3001234567', 'juan.perez@email.com'),
(2, 'Carrera 50 # 80-45', 'Medellín', '3109876543', 'laura.ramirez@email.com'),
(3, 'Calle 85 # 15-20', 'Bogotá', '3201112233', 'michael.smith@email.com'),
(4, 'Avenida 5N # 25-50', 'Cali', '3154445566', 'andrea.martinez@email.com');

-- Solicitudes con diferentes estados
INSERT INTO solicitudes_apertura (id_cliente, tipo_cuenta, estado, comentario_director, fecha_respuesta) VALUES
(1, 'Ahorros', 'Aprobada', 'Cliente cumple con todos los requisitos. Aprobado.', NOW()),
(2, 'Ahorros', 'Aprobada', 'Documentación completa. Aprobado.', NOW()),
(3, 'Ahorros', 'Rechazada', 'Información financiera incompleta. Rechazado.', NOW()),
(4, 'Ahorros', 'Devuelta', 'Favor completar información laboral actualizada.', NOW());

-- Verificar que los datos se insertaron correctamente
SELECT 
    c.tipo_documento,
    c.numero_documento,
    c.nombre_completo,
    s.estado,
    s.comentario_director
FROM clientes c
LEFT JOIN solicitudes_apertura s ON c.id_cliente = s.id_cliente;


SELECT * FROM cuentas_ahorro;