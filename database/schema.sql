-- ============================================
-- BASE DE DATOS BANCA UNO 
-- Fecha: Noviembre 6, 2025
-- ============================================

DROP DATABASE IF EXISTS banca_uno;
CREATE DATABASE banca_uno CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banca_uno;

-- =========================================================
-- TABLA: Clientes
-- =========================================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    tipo_documento ENUM('CC', 'TI', 'R.Civil', 'PPT', 'Pasaporte', 'Carne diplomático', 'Cédula de extranjería') NOT NULL,
    lugar_expedicion VARCHAR(100),
    ciudad_nacimiento VARCHAR(100),
    fecha_nacimiento DATE NOT NULL,
    fecha_expedicion DATE,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    genero ENUM('M', 'F') NOT NULL,
    nacionalidad ENUM('Colombiano', 'Estadounidense', 'Otra') NOT NULL,
    otra_nacionalidad VARCHAR(100),
    estado_civil ENUM('Soltero', 'Casado', 'Unión Libre') NOT NULL,
    grupo_etnico ENUM('Indígena', 'Gitano', 'Raizal', 'Palenquero', 'Afrocolombiano', 'Ninguna') NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_documento (tipo_documento, numero_documento),
    INDEX idx_nombres (primer_nombre, primer_apellido)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Contacto Personal
-- =========================================================
CREATE TABLE contacto_personal (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    direccion VARCHAR(255),
    barrio VARCHAR(100),
    departamento VARCHAR(100),
    telefono VARCHAR(20),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    correo VARCHAR(100),
    bloque_torre VARCHAR(50),
    apto_casa VARCHAR(50),
    id_cliente INT UNIQUE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Información Financiera
-- =========================================================
CREATE TABLE info_financiera (
    id_info_financiera INT AUTO_INCREMENT PRIMARY KEY,
    ingresos_mensuales DECIMAL(15,2),
    egresos_mensuales DECIMAL(15,2),
    total_activos DECIMAL(15,2),
    total_pasivos DECIMAL(15,2),
    id_cliente INT UNIQUE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Actividad Económica
-- =========================================================
CREATE TABLE actividad_economica (
    id_actividad_economica INT AUTO_INCREMENT PRIMARY KEY,
    profesion VARCHAR(100),
    ocupacion VARCHAR(100),
    codigo_CIIU VARCHAR(20),
    detalle_actividad TEXT,
    numero_empleados INT,
    facta_crs ENUM('Sí', 'No') DEFAULT 'No',
    id_cliente INT UNIQUE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Información Laboral
-- =========================================================
CREATE TABLE info_laboral (
    id_info_laboral INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(100) NOT NULL,
    direccion_empresa VARCHAR(150),
    pais_empresa VARCHAR(100),
    departamento_empresa VARCHAR(100),
    ciudad_empresa VARCHAR(100),
    telefono_empresa VARCHAR(20),
    ext VARCHAR(10),
    celular_empresa VARCHAR(20),
    correo_laboral VARCHAR(100),
    id_cliente INT UNIQUE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: FACTA CRS
-- =========================================================
CREATE TABLE Facta_Crs (
    id_facta_crs INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    es_residente_extranjero ENUM('Sí', 'No') NOT NULL DEFAULT 'No',
    pais VARCHAR(100),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Usuarios (DEBE IR ANTES DE SOLICITUDES)
-- =========================================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_correo (correo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Roles (DEBE IR ANTES DE USUARIO_ROL)
-- =========================================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Usuario-Rol (DEBE IR ANTES DE SOLICITUDES)
-- =========================================================
CREATE TABLE usuario_rol (
    id_usuario_rol INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_rol (id_usuario, id_rol),
    INDEX idx_usuario (id_usuario),
    INDEX idx_rol (id_rol)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Solicitudes de Apertura
-- =========================================================
CREATE TABLE solicitudes_apertura (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario_rol INT NULL COMMENT 'Asesor que creó la solicitud (opcional)',
    tipo_cuenta ENUM('Ahorros') NOT NULL DEFAULT 'Ahorros',
    estado ENUM('Pendiente','Aprobada','Rechazada','Devuelta','Aperturada') NOT NULL DEFAULT 'Pendiente',
    comentario_director TEXT,
    comentario_asesor TEXT NULL,
    archivo LONGBLOB NULL COMMENT 'Documentos adjuntos (opcional)',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP NULL,
    CONSTRAINT fk_sol_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_sol_usuario_rol FOREIGN KEY (id_usuario_rol) REFERENCES usuario_rol(id_usuario_rol) ON DELETE SET NULL,
    INDEX idx_sol_estado (estado),
    INDEX idx_sol_cliente (id_cliente),
    INDEX idx_sol_usuario_rol (id_usuario_rol)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Cuentas de Ahorro
-- =========================================================
CREATE TABLE cuentas_ahorro (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    numero_cuenta VARCHAR(20) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_solicitud INT NULL,
    saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    estado_cuenta ENUM('Activa','Inactiva','Bloqueada','Cerrada') NOT NULL DEFAULT 'Activa',
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cta_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_cta_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitudes_apertura(id_solicitud),
    INDEX idx_cta_numero (numero_cuenta),
    INDEX idx_cta_cliente (id_cliente),
    INDEX idx_cta_solicitud (id_solicitud),
    INDEX idx_estado (estado_cuenta)
) ENGINE=InnoDB;
select * from cuentas_ahorro;

-- =========================================================
-- TABLA: Transacciones
-- =========================================================
CREATE TABLE transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta INT NOT NULL,
    tipo_transaccion ENUM('Apertura', 'Depósito', 'Retiro', 'Nota Débito', 'Cancelación', 'Transferencia', 'Pago', 'Otro') NOT NULL,
    tipo_deposito ENUM('Efectivo', 'Cheque', 'Transferencia', 'Otro') NULL,
    monto DECIMAL(15,2) NOT NULL,
    codigo_cheque VARCHAR(50) NULL,
    numero_cheque VARCHAR(50) NULL,
    saldo_anterior DECIMAL(15,2),
    saldo_nuevo DECIMAL(15,2),
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cajero VARCHAR(50) NULL COMMENT 'Cajero que realizó la transacción',
    motivo_cancelacion VARCHAR(500) NULL COMMENT 'Motivo de cancelación de cuenta',
    FOREIGN KEY (id_cuenta) REFERENCES cuentas_ahorro(id_cuenta) ON DELETE CASCADE,
    INDEX idx_cuenta_trans (id_cuenta),
    INDEX idx_tipo_trans (tipo_transaccion),
    INDEX idx_fecha (fecha_transaccion),
    INDEX idx_cajero (cajero)
) ENGINE=InnoDB;

select * from transacciones;
-- =========================================================
-- TABLA: Saldos del Cajero
-- =========================================================
CREATE TABLE saldos_cajero (
    id_saldo INT AUTO_INCREMENT PRIMARY KEY,
    cajero VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del cajero',
    saldo_efectivo DECIMAL(15, 2) DEFAULT 0.00,
    saldo_cheques DECIMAL(15, 2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cajero (cajero),
    INDEX idx_fecha (fecha_actualizacion)
) ENGINE=InnoDB;
select * from saldos_cajero;

-- =========================================================
-- TABLA: Traslados Entre Cajeros
-- =========================================================
CREATE TABLE traslados_cajero (
    id_traslado INT AUTO_INCREMENT PRIMARY KEY,
    cajero_origen VARCHAR(50) NOT NULL,
    cajero_destino VARCHAR(50) NOT NULL,
    monto DECIMAL(15, 2) NOT NULL,
    estado ENUM('Pendiente', 'Aceptado') DEFAULT 'Pendiente',
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aceptacion TIMESTAMP NULL,
    INDEX idx_destino_estado (cajero_destino, estado),
    INDEX idx_estado (estado),
    INDEX idx_origen (cajero_origen)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Gestión de Cuentas
-- =========================================================
CREATE TABLE gestion_cuentas (
    id_gestion_cuentas INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_cuenta INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_cuenta) REFERENCES cuentas_ahorro(id_cuenta) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_cuenta (id_cuenta)
) ENGINE=InnoDB;

-- ============================================
-- DATOS DE PRUEBA - CLIENTES (5 CLIENTES)
-- ============================================
INSERT INTO clientes (numero_documento, tipo_documento, lugar_expedicion, ciudad_nacimiento, fecha_nacimiento, fecha_expedicion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, genero, nacionalidad, otra_nacionalidad, estado_civil, grupo_etnico) VALUES
('1012345678', 'CC', 'Bogotá', 'Bogotá', '1990-05-15', '2008-05-15', 'Juan', 'Carlos', 'Pérez', 'Gómez', 'M', 'Colombiano', NULL, 'Soltero', 'Ninguna'),
('1023456789', 'CC', 'Medellín', 'Medellín', '1985-08-22', '2003-08-22', 'Laura', 'Marcela', 'Ramírez', 'López', 'F', 'Colombiano', NULL, 'Casado', 'Ninguna'),
('1034567890', 'CC', 'Cali', 'Cali', '1995-03-30', '2013-03-30', 'Andrea', 'Carolina', 'Martínez', 'Vargas', 'F', 'Colombiano', NULL, 'Unión Libre', 'Ninguna'),
('1045678901', 'CC', 'Bogotá', 'Bogotá', '1992-07-18', '2010-07-18', 'Carlos', 'Alberto', 'Rodríguez', 'Torres', 'M', 'Colombiano', NULL, 'Soltero', 'Ninguna'),
('1056789012', 'CC', 'Bogotá', 'Bogotá', '1998-11-25', '2016-11-25', 'María', 'José', 'García', 'Hernández', 'F', 'Colombiano', NULL, 'Soltero', 'Ninguna');

-- ============================================
-- DATOS DE PRUEBA - CONTACTO PERSONAL
-- ============================================
INSERT INTO contacto_personal (id_cliente, direccion, barrio, departamento, telefono, ciudad, pais, correo, bloque_torre, apto_casa) VALUES
(1, 'Calle 100 # 20-30', 'Chicó', 'Cundinamarca', '3001234567', 'Bogotá', 'Colombia', 'juan.perez@email.com', NULL, NULL),
(2, 'Carrera 50 # 80-45', 'Laureles', 'Antioquia', '3109876543', 'Medellín', 'Colombia', 'laura.ramirez@email.com', NULL, NULL),
(3, 'Avenida 5N # 25-50', 'Granada', 'Valle del Cauca', '3154445566', 'Cali', 'Colombia', 'andrea.martinez@email.com', NULL, NULL),
(4, 'Calle 72 # 10-15', 'Chapinero', 'Cundinamarca', '3167778899', 'Bogotá', 'Colombia', 'carlos.rodriguez@email.com', NULL, NULL),
(5, 'Carrera 7 # 45-67', 'Centro', 'Cundinamarca', '3178889900', 'Bogotá', 'Colombia', 'maria.garcia@email.com', NULL, NULL);

-- ============================================
-- DATOS DE PRUEBA - INFORMACIÓN FINANCIERA
-- ============================================
INSERT INTO info_financiera (id_cliente, ingresos_mensuales, egresos_mensuales, total_activos, total_pasivos) VALUES
(1, 5000000.00, 2500000.00, 50000000.00, 10000000.00),
(2, 8000000.00, 4000000.00, 120000000.00, 30000000.00),
(3, 6000000.00, 3000000.00, 80000000.00, 20000000.00),
(4, 4500000.00, 2200000.00, 40000000.00, 8000000.00),
(5, 3500000.00, 1800000.00, 25000000.00, 5000000.00);

-- ============================================
-- DATOS DE PRUEBA - ACTIVIDAD ECONÓMICA
-- ============================================
INSERT INTO actividad_economica (id_cliente, profesion, ocupacion, codigo_CIIU, detalle_actividad, numero_empleados, facta_crs) VALUES
(1, 'Ingeniero de Sistemas', 'Desarrollador', '6201', 'Desarrollo de software', 0, 'No'),
(2, 'Contador', 'Contadora', '6920', 'Contabilidad y auditoría', 0, 'No'),
(3, 'Administradora', 'Gerente', '7020', 'Administración de empresas', 5, 'No'),
(4, 'Abogado', 'Abogado', '6910', 'Servicios jurídicos', 0, 'No'),
(5, 'Diseñadora', 'Diseñadora Gráfica', '7410', 'Diseño gráfico y publicidad', 0, 'No');

-- ============================================
-- DATOS DE PRUEBA - INFORMACIÓN LABORAL
-- ============================================
INSERT INTO info_laboral (id_cliente, nombre_empresa, direccion_empresa, pais_empresa, departamento_empresa, ciudad_empresa, telefono_empresa, ext, celular_empresa, correo_laboral) VALUES
(1, 'Tech Solutions SAS', 'Calle 50 # 10-20', 'Colombia', 'Cundinamarca', 'Bogotá', '6011234567', '101', '3001234567', 'juan@techsolutions.com'),
(2, 'Contadores Unidos', 'Carrera 70 # 45-10', 'Colombia', 'Antioquia', 'Medellín', '6042345678', '202', '3109876543', 'laura@contadores.com'),
(3, 'Empresas del Valle', 'Avenida 6N # 30-15', 'Colombia', 'Valle del Cauca', 'Cali', '6023456789', '303', '3154445566', 'andrea@empresasvalle.com'),
(4, 'Bufete Jurídico Ltda', 'Calle 85 # 15-30', 'Colombia', 'Cundinamarca', 'Bogotá', '6014567890', '404', '3167778899', 'carlos@bufete.com'),
(5, 'Diseños Creativos', 'Carrera 15 # 80-25', 'Colombia', 'Cundinamarca', 'Bogotá', '6015678901', '505', '3178889900', 'maria@disenoscreativos.com');

-- ============================================
-- DATOS DE PRUEBA - FACTA CRS
-- ============================================
INSERT INTO Facta_Crs (id_cliente, es_residente_extranjero, pais) VALUES
(1, 'No', NULL),
(2, 'No', NULL),
(3, 'No', NULL),
(4, 'No', NULL),
(5, 'No', NULL);

-- ============================================
-- ROLES DE USUARIO
-- ============================================
INSERT INTO roles (nombre, descripcion) VALUES
('Cajero', 'Realiza operaciones de ventanilla (apertura, consignación, retiro, etc.)'),
('Asesor', 'Gestiona clientes y solicitudes de apertura'),
('Director-operativo', 'Revisa y aprueba/rechaza solicitudes de apertura de cuentas'),
('Administrador', 'Acceso total al sistema');

-- ============================================
-- USUARIOS DE PRUEBA
-- Contraseña para todos: "Cajero123"
-- Hash: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
-- ============================================
INSERT INTO usuarios (nombre, correo, contrasena, activo) VALUES
('María González', 'maria.cajero@bancauno.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', TRUE),
('Carlos Ramírez', 'carlos.asesor@bancauno.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', TRUE),
('Luis Fernández', 'luis.director@bancauno.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', TRUE),
('Ana Martínez', 'ana.admin@bancauno.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', TRUE);

-- ============================================
-- ASIGNAR ROLES A USUARIOS
-- ============================================

-- María González - Cajero
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
CROSS JOIN roles r
WHERE u.correo = 'maria.cajero@bancauno.com'
  AND r.nombre = 'Cajero';

-- Carlos Ramírez - Asesor
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
CROSS JOIN roles r
WHERE u.correo = 'carlos.asesor@bancauno.com'
  AND r.nombre = 'Asesor';

-- Luis Fernández - Director Operativo
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
CROSS JOIN roles r
WHERE u.correo = 'luis.director@bancauno.com'
  AND r.nombre = 'Director-operativo';

-- Ana Martínez - Administrador
INSERT INTO usuario_rol (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u
CROSS JOIN roles r
WHERE u.correo = 'ana.admin@bancauno.com'
  AND r.nombre = 'Administrador';

-- ============================================
-- SOLICITUDES DE APERTURA CON ASESOR
-- ============================================
INSERT INTO solicitudes_apertura (id_cliente, id_usuario_rol, tipo_cuenta, estado, comentario_director, fecha_respuesta) VALUES
(1, 2, 'Ahorros', 'Aprobada', 'Cliente cumple con todos los requisitos. Aprobado.', NOW()),
(2, 2, 'Ahorros', 'Aprobada', 'Documentación completa. Aprobado.', NOW()),
(3, 2, 'Ahorros', 'Rechazada', 'Información financiera incompleta. Rechazado.', NOW()),
(4, 2, 'Ahorros', 'Aprobada', 'Todo en orden. Aprobado.', NOW()),
(5, 2, 'Ahorros', 'Aprobada', 'Cliente verificado. Listo para apertura de cuenta.', NOW());

-- ============================================
-- CUENTAS DE AHORRO (4 CUENTAS)
-- ============================================
INSERT INTO cuentas_ahorro (numero_cuenta, id_cliente, id_solicitud, saldo, estado_cuenta) VALUES
('4001000001', 1, 1, 500000.00, 'Activa'),
('4001000002', 2, 2, 1200000.00, 'Activa'),
('4001000003', 4, 4, 350000.00, 'Activa'),
('4001000004', 1, NULL, 0.00, 'Cerrada');

-- ============================================
-- TRANSACCIONES DE PRUEBA
-- ============================================
INSERT INTO transacciones (id_cuenta, tipo_transaccion, tipo_deposito, monto, saldo_anterior, saldo_nuevo, cajero, motivo_cancelacion) VALUES
(1, 'Apertura', NULL, 0.00, 0.00, 0.00, 'María González', NULL),
(1, 'Depósito', 'Efectivo', 500000.00, 0.00, 500000.00, 'María González', NULL),
(2, 'Apertura', NULL, 0.00, 0.00, 0.00, 'María González', NULL),
(2, 'Depósito', 'Efectivo', 1000000.00, 0.00, 1000000.00, 'María González', NULL),
(2, 'Depósito', 'Cheque', 200000.00, 1000000.00, 1200000.00, 'María González', NULL),
(3, 'Apertura', NULL, 0.00, 0.00, 0.00, 'María González', NULL),
(3, 'Depósito', 'Efectivo', 500000.00, 0.00, 500000.00, 'María González', NULL),
(3, 'Retiro', NULL, 150000.00, 500000.00, 350000.00, 'María González', NULL),
(4, 'Apertura', NULL, 0.00, 0.00, 0.00, 'María González', NULL),
(4, 'Cancelación', NULL, 0.00, 0.00, 0.00, 'María González', 'Solicitud del cliente por mudanza al exterior');

-- ============================================
-- SALDOS DE CAJEROS
-- ============================================
INSERT INTO saldos_cajero (cajero, saldo_efectivo, saldo_cheques) VALUES
('María González', 2000000.00, 150000.00),
('Cajero Auxiliar 01', 1500000.00, 50000.00),
('Cajero Auxiliar 02', 800000.00, 200000.00),
('Cajero Principal', 5000000.00, 300000.00);

-- ============================================
-- TRASLADOS ENTRE CAJEROS
-- ============================================
INSERT INTO traslados_cajero (cajero_origen, cajero_destino, monto, estado, fecha_envio, fecha_aceptacion) VALUES
('Cajero Auxiliar 01', 'María González', 50000.00, 'Pendiente', NOW(), NULL),
('Cajero Principal', 'María González', 100000.00, 'Pendiente', NOW(), NULL),
('Cajero Auxiliar 02', 'Cajero Principal', 200000.00, 'Aceptado', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================

SELECT '=== RESUMEN DE LA BASE DE DATOS ===' AS '';

SELECT 
    'Clientes' AS tabla,
    COUNT(*) AS registros,
    'Datos personales de clientes' AS descripcion
FROM clientes
UNION ALL
SELECT 
    'Usuarios',
    COUNT(*),
    'Usuarios del sistema con JWT'
FROM usuarios
UNION ALL
SELECT 
    'Roles',
    COUNT(*),
    'Roles disponibles'
FROM roles
UNION ALL
SELECT 
    'Cuentas Activas',
    COUNT(*),
    'Cuentas de ahorro activas'
FROM cuentas_ahorro
WHERE estado_cuenta = 'Activa'
UNION ALL
SELECT 
    'Transacciones',
    COUNT(*),
    'Historial de transacciones'
FROM transacciones
UNION ALL
SELECT 
    'Cajeros',
    COUNT(*),
    'Cajeros con saldo asignado'
FROM saldos_cajero;

-- Ver usuarios con sus roles
SELECT 
    '=== USUARIOS Y ROLES ===' AS '';

SELECT 
    u.nombre AS usuario,
    u.correo,
    r.nombre AS rol,
    u.activo
FROM usuarios u
LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
LEFT JOIN roles r ON ur.id_rol = r.id_rol
ORDER BY r.nombre, u.nombre;

UPDATE usuarios SET contrasena = '$2b$10$roq3wNFqZbrNiy59smH.xOQBcj2RiG8uzsGeRUx.cOMJJLbcW7hRi' WHERE correo = 'maria.cajero@bancauno.com';

SELECT * FROM traslados_cajero;
SELECT * FROM usuarios;

SELECT * FROM clientes;
SELECT * FROM cuentas_ahorro;
SELECT * FROM transacciones;