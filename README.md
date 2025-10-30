# backend-nestjs

## 🏗️ **ARQUITECTURA DE TESTING DEFINIDA**

### **Patrón de Testing: Unit Testing First + Integration Testing**

Seguimos el patrón **"Testing Pyramid"** adaptado para NestJS:

- **80% Unit Tests** (lo que estamos configurando)
- **15% Integration Tests** (dentro de los unit tests con mocks controlados)
- **5% E2E Tests** (ya existentes)

### **Estructura de Testing por Capas**

```text
test/unit/
├── [module]/
│   ├── [module].service.spec.ts     # 🧪 Servicios (prioridad alta)
│   ├── [module].controller.spec.ts  # 🌐 Controladores (prioridad media)
│   └── [module].module.spec.ts      # 📦 Módulos (prioridad baja)
```

## 📋 **GUÍA COMPLETA DE TESTING - MEJORES PRÁCTICAS**

### **1. FILOSOFÍA DE TESTING**

#### "Test the behavior, not the implementation"

- Enfócate en **qué** hace el código, no **cómo** lo hace
- Tests deben ser **independientes** del framework interno
- **Mocks** para dependencias externas, **no para lógica de negocio**

### **2. ESTRUCTURA DE UN TEST UNITARIO**

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<Dependency>;

  // 🏗️ SETUP: Configuración del módulo de testing
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServiceName, mockProviders],
    }).compile();
    
    service = module.get<ServiceName>(ServiceName);
  });

  // 🧹 CLEANUP: Limpieza automática
  afterEach(() => jest.clearAllMocks());

  describe('MethodName', () => {
    // ✅ CASOS DE ÉXITO
    it('should return expected result when valid input', async () => {
      // Arrange
      mockDependency.method.mockResolvedValue(expectedData);
      
      // Act
      const result = await service.method(validInput);
      
      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockDependency.method).toHaveBeenCalledWith(validInput);
    });

    // ❌ CASOS DE ERROR
    it('should throw exception when invalid input', async () => {
      // Arrange
      mockDependency.method.mockRejectedValue(new Error());
      
      // Act & Assert
      await expect(service.method(invalidInput))
        .rejects.toThrow(ExpectedException);
    });

    // 🔄 CASOS EDGE
    it('should handle edge case properly', async () => {
      // Test casos límite, valores nulos, arrays vacíos, etc.
    });
  });
});
```

### **3. PATRONES DE MOCKING**

#### **Database Layer (TypeORM/Mongoose)**

```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  // ... otros métodos
};

// En el módulo de testing
.overrideProvider(getRepositoryToken(Entity))
.useValue(mockRepository)
```

#### **External Services**

```typescript
const mockService = {
  method: jest.fn(),
};

// Inyección directa
{
  provide: ExternalService,
  useValue: mockService,
}
```

### **4. COBERTURA Y MÉTRICAS**

#### Objetivo: 80% coverage mínimo

- **Statements**: Líneas ejecutadas
- **Branches**: Condicionales (if/else, switch)
- **Functions**: Métodos ejecutados
- **Lines**: Cobertura de líneas

**Exclusiones justificadas:**

- Entities: Datos puros
- DTOs: Estructuras de datos
- Interfaces: Contratos
- Controllers: Testing vía E2E
- Configs: Valores estáticos

### **5. TESTING DE SERVICIOS (PRIORIDAD ALTA)**

**Patrón AAA (Arrange-Act-Assert):**

1. **Arrange**: Configurar mocks y datos de prueba
2. **Act**: Ejecutar el método bajo prueba
3. **Assert**: Verificar resultado y llamadas

**Casos a cubrir:**

- ✅ **Happy Path**: Flujo normal
- ❌ **Error Handling**: Excepciones esperadas
- 🔄 **Edge Cases**: Límites y casos especiales
- 🎯 **Business Logic**: Reglas de negocio específicas

### **6. TESTING DE CONTROLADORES (PRIORIDAD MEDIA)**

```typescript
describe('ControllerName', () => {
  let controller: ControllerName;
  let service: jest.Mocked<ServiceName>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ControllerName],
      providers: [{
        provide: ServiceName,
        useValue: mockService
      }],
    }).compile();

    controller = module.get<ControllerName>(ControllerName);
    service = module.get(ServiceName);
  });

  it('should return data from service', async () => {
    service.findAll.mockResolvedValue([mockData]);
    
    const result = await controller.findAll();
    
    expect(result).toEqual([mockData]);
  });
});
```

## 🎯 **DIVISIÓN DE TRABAJO PARA CODING AGENT**

### **Análisis de Módulos**

Tu proyecto tiene **16 módulos principales**:

| Módulo | Complejidad | Prioridad | Estimación |
|--------|-------------|-----------|------------|
| users | 🔴 Alta | 1 | 4-6 horas |
| auth | 🔴 Alta | 1 | 3-4 horas |
| common | 🟡 Media | 2 | 2-3 horas |
| storage | 🟡 Media | 2 | 2-3 horas |
| permissions | 🔴 Alta | 1 | 5-7 horas |
| audit | 🟡 Media | 2 | 3-4 horas |
| carts | 🟡 Media | 3 | 2-3 horas |
| designs | 🟡 Media | 3 | 3-4 horas |
| orders | 🟡 Media | 3 | 3-4 horas |
| addresses | 🟢 Baja | 4 | 1-2 horas |
| categories | 🟢 Baja | 4 | 1-2 horas |
| cloths | 🟢 Baja | 4 | 2-3 horas |
| images | 🟢 Baja | 4 | 1-2 horas |
| stocks | 🟢 Baja | 4 | 2-3 horas |
| transactions | 🟡 Media | 3 | 2-3 horas |
| design-history | 🟢 Baja | 4 | 1-2 horas |
| cart-design | 🟢 Baja | 4 | 1-2 horas |
| custom-images | 🟢 Baja | 4 | 1-2 horas |

### **Estrategia de División por Tareas**

**Recomendación: 3-4 módulos por tarea** para mantener eficiencia y calidad.

#### **TAREA 1: Core Business Logic (Prioridad 1)**

**Módulos:** `users`, `auth`, `permissions`
**Tiempo estimado:** 12-17 horas
**Razón:** Lógica crítica de negocio, autenticación y autorización

#### **TAREA 2: Infrastructure & Audit (Prioridad 2)**  

**Módulos:** `common`, `storage`, `audit`
**Tiempo estimado:** 7-10 horas
**Razón:** Servicios compartidos y auditoría

#### **TAREA 3: E-commerce Core (Prioridad 3)**

**Módulos:** `carts`, `designs`, `orders`
**Tiempo estimado:** 8-10 horas
**Razón:** Funcionalidad principal de e-commerce

#### **TAREA 4: Supporting Modules (Prioridad 4)**

**Módulos:** `addresses`, `categories`, `cloths`, `images`
**Tiempo estimado:** 5-8 horas
**Razón:** Módulos de soporte con menor complejidad

#### **TAREA 5: Advanced Features (Prioridad 3-4)**

**Módulos:** `stocks`, `transactions`, `design-history`, `cart-design`, `custom-images`
**Tiempo estimado:** 6-9 horas
**Razón:** Características avanzadas y especializadas

## 🚀 **PROTOCOLO DE IMPLEMENTACIÓN**

### **Para cada módulo, el coding agent debe:**

1. **📖 Análisis del Código**
   - Leer el service/controller
   - Identificar métodos públicos
   - Analizar dependencias

2. **🎯 Definir Casos de Prueba**
   - Happy paths
   - Error scenarios  
   - Edge cases
   - Business rules

3. **🛠️ Configurar Mocks**
   - Database repositories
   - External services
   - Configuration values

4. **✍️ Implementar Tests**
   - Seguir patrón AAA
   - Usar nombres descriptivos
   - Cubrir todos los escenarios

5. **✅ Verificar Coverage**
   - Ejecutar `npm run test:unit:cov`
   - Asegurar >80% por módulo
   - Revisar líneas no cubiertas

### **Checklist por Módulo**

- [ ] Archivo `test/unit/[module]/[module].service.spec.ts` creado
- [ ] Todos los métodos públicos testeados
- [ ] Casos de error manejados
- [ ] Mocks configurados correctamente
- [ ] Coverage >80% para el módulo
- [ ] Tests pasan en CI/CD

### **Comandos Útiles**

```bash
# Ejecutar tests de un módulo específico
npm run test:unit -- test/unit/users

# Ver coverage detallado
npm run test:unit:cov

# Debug tests
npm run test:unit:debug
```

Esta estrategia asegura **calidad consistente**, **mantenibilidad** y **escalabilidad** de las pruebas, siguiendo las mejores prácticas de NestJS y testing moderno.
