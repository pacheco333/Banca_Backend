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
    INDEX idx_documento (tipo_documento, numero_documento)
) ENGINE=InnoDB;

select * from clientes;
INSERT INTO clientes (
    numero_documento,
    tipo_documento,
    lugar_expedicion,
    ciudad_nacimiento,
    fecha_nacimiento,
    fecha_expedicion,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    genero,
    nacionalidad,
    otra_nacionalidad,
    estado_civil,
    grupo_etnico
) VALUES (
    '11111111',
    'CC',
    'Bogotá D.C.',
    'Medellín',
    '1990-05-14',
    '2008-06-20',
    'Carlos',
    'Andrés',
    'Gómez',
    'Pérez',
    'M',
    'Colombiano',
    NULL,
    'Casado',
    'Ninguna'
);

select * from clientes;
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
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
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
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
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
    id_cliente INT UNIQUE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
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
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: FACTA CRS
-- =========================================================
CREATE TABLE Facta_Crs (
    id_facta_crs INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    es_residente_extranjero ENUM('Sí', 'No') NOT NULL DEFAULT 'No',
    pais VARCHAR(100),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Solicitudes de Apertura
-- =========================================================


CREATE TABLE solicitudes_apertura (
  id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_usuario_rol INT NOT NULL,
  tipo_cuenta ENUM('Ahorros') NOT NULL DEFAULT 'Ahorros',
  estado ENUM('Pendiente','Aprobada','Rechazada','Devuelta') NOT NULL DEFAULT 'Pendiente',
  comentario_director TEXT,
  comentario_asesor TEXT,
  archivo LONGBLOB,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP NULL,
  CONSTRAINT fk_sol_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  CONSTRAINT fk_sol_usuario_rol FOREIGN KEY (id_usuario_rol) REFERENCES usuario_rol(id_usuario_rol) ON DELETE RESTRICT,
  INDEX idx_sol_estado (estado),
  INDEX idx_sol_cliente (id_cliente),
  INDEX idx_sol_usuario_rol (id_usuario_rol)
) ENGINE=InnoDB;

select * from solicitudes_apertura;
-- =========================================================
-- TABLA: Cuentas de Ahorro
-- =========================================================
CREATE TABLE cuentas_ahorro (
  id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
  numero_cuenta VARCHAR(20) NOT NULL UNIQUE,
  id_cliente INT NOT NULL,
  id_solicitud INT NOT NULL,
  saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  estado_cuenta ENUM('Activa','Inactiva','Bloqueada','Cerrada') NOT NULL DEFAULT 'Activa',
  fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cta_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  CONSTRAINT fk_cta_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitudes_apertura(id_solicitud),
  INDEX idx_cta_numero (numero_cuenta),
  INDEX idx_cta_cliente (id_cliente),
  INDEX idx_cta_solicitud (id_solicitud)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Transacciones
-- =========================================================
CREATE TABLE transacciones (
    id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta INT NOT NULL,
    tipo_transaccion ENUM('Depósito', 'Retiro', 'Transferencia', 'Pago', 'Otro') NOT NULL,
    tipo_deposito ENUM('Efectivo', 'Cheque', 'Transferencia', 'Otro') NULL,
    monto DECIMAL(15,2) NOT NULL,
    codigo_cheque VARCHAR(50) NULL,
    numero_cheque VARCHAR(50) NULL,
    saldo_anterior DECIMAL(15,2) NOT NULL,
    saldo_nuevo DECIMAL(15,2) NOT NULL,
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta) REFERENCES cuentas_ahorro(id_cuenta) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Usuarios
-- =========================================================
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

select * from usuarios;
-- =========================================================
-- TABLA: Roles
-- =========================================================
CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema, puede gestionar usuarios y configuraciones'),
('Asesor', 'Puede crear y gestionar solicitudes de apertura de cuentas'),
('Cajero', 'Realiza operaciones de caja y transacciones básicas'),
('Director-operativo', 'Revisa y aprueba/rechaza solicitudes de apertura de cuentas');

-- =========================================================
-- TABLA: Permisos
-- =========================================================
CREATE TABLE permisos (
  id_permiso INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Usuario-Rol
-- =========================================================
CREATE TABLE usuario_rol (
  id_usuario_rol INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_rol INT NOT NULL,
  asignado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- TABLA: Rol-Permiso
-- =========================================================
CREATE TABLE rol_permiso (
  id_rol_permiso INT AUTO_INCREMENT PRIMARY KEY,
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
  FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE
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
  FOREIGN KEY (id_cuenta) REFERENCES cuentas_ahorro(id_cuenta) ON DELETE CASCADE
) ENGINE=InnoDB;


SELECT 
  u.id_usuario,
  u.nombre,
  u.correo,
  r.nombre AS rol,
  r.descripcion,
  ur.asignado_en
FROM usuarios u
LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
LEFT JOIN roles r ON ur.id_rol = r.id_rol
ORDER BY u.nombre, r.nombre;

select * from usuario_rol;
select * from clientes;
select * from usuarios;
select * from solicitudes_apertura;







