# Base de Datos - Sistema Bancario Banca Uno

## 📋 Descripción
Base de datos para el sistema de apertura de cuentas de ahorro.

## 🚀 Instalación

### 1. Crear la base de datos
Ejecuta el script `schema.sql` en MySQL Workbench

### 2. Configurar conexión
Edita el archivo `src/config/database.ts` con tus credenciales

---

## 👥 Clientes de Prueba

| Documento | Cliente | Estado Solicitud | Puede Abrir Cuenta | Cuenta Activa |
|-----------|---------|------------------|-------------------|---------------|
| CC 1012345678 | Juan Pérez | ✅ APROBADA | ❌ | 4001000001 ($500,000) |
| CC 1023456789 | Laura Ramírez | ✅ APROBADA | ❌ | 4001000002 ($1,200,000) |
| CC 1034567890 | Andrea Martínez | ❌ RECHAZADA | ❌ | Ninguna |
| CC 1045678901 | Carlos Rodríguez | ✅ APROBADA | ❌ | 4001000003 ($350,000) |
| CC 1056789012 | María García | ✅ APROBADA | ✅✅✅ | **NINGUNA** |

---

## 💰 Saldos de Cajeros

| Cajero | Efectivo | Cheques | Total |
|--------|----------|---------|-------|
| Cajero Principal | $5,000,000 | $300,000 | $5,300,000 |
| Cajero 01 | $1,500,000 | $50,000 | $1,550,000 |
| Cajero 02 | $800,000 | $200,000 | $1,000,000 |
| Cajero 03 | $600,000 | $0 | $600,000 |
| Cajero 04 | $1,000,000 | $100,000 | $1,100,000 |
| Cajero 05 | $500,000 | $0 | $500,000 |

---

## 🧪 Casos de Prueba Rápidos

### ✅ Apertura de Cuenta
- **Cliente 5 (CC 1056789012)** → ÚNICO que puede abrir cuenta

### ✅ Consignación / Retiro / Nota Débito
- Cuenta **4001000001** → Saldo: $500,000
- Cuenta **4001000002** → Saldo: $1,200,000
- Cuenta **4001000003** → Saldo: $350,000

### ✅ Cancelación de Cuenta
- **Cuenta 4001000003** → Dejar saldo en $0, luego cancelar

### ✅ Traslados Pendientes
- Cajero 02 puede aceptar $50,000 desde Cajero 01
- Cajero 01 puede aceptar $100,000 desde Cajero Principal
- Cajero 04 puede aceptar $75,000 desde Cajero 03
