import { renderHook, act } from '@testing-library/react'
import { useFlagsState } from './useFlags'
import { useFlagsState as useFlagsStateFromIndex } from './index'

/**
 * ============================================================================
 * CONSTANTES Y HELPERS PARA TESTS
 * ============================================================================
 */

// Estados iniciales comunes usados en múltiples tests
const COMMON_INITIAL_STATES = {
  loadingStates: {
    isLoading: false,
    isOpen: true,
    isVisible: false
  },
  simpleFlags: {
    flag1: false,
    flag2: false
  },
  mixedFlags: {
    flag1: true,
    flag2: false
  },
  threeFlags: {
    flag1: false,
    flag2: false,
    flag3: false
  }
} as const

/**
 * Helper para crear un estado inicial con flags genéricos
 */
const createFlagState = (count: number, initialValue: boolean = false) => {
  return Array.from({ length: count }, (_, i) => i).reduce(
    (acc, i) => ({ ...acc, [`flag${i + 1}`]: initialValue }),
    {} as Record<string, boolean>
  )
}

/**
 * Helper para crear un estado inicial con muchos flags (para tests de rendimiento)
 */
const createManyFlagsState = (count: number, initialValue: boolean = false) => {
  return Array.from({ length: count }, (_, i) => i).reduce(
    (acc, i) => ({ ...acc, [`flag${i}`]: initialValue }),
    {} as Record<string, boolean>
  )
}

/**
 * Helper para verificar que el hook retorna las funciones esperadas
 */
const expectHookReturnsFunctions = (result: { current: { setFlags: unknown; setFlag: unknown } }) => {
  expect(typeof result.current.setFlags).toBe('function')
  expect(typeof result.current.setFlag).toBe('function')
}

/**
 * ============================================================================
 * GUÍA DE TESTING PARA HOOKS DE REACT
 * ============================================================================
 * 
 * En este archivo vamos a testear el hook useFlagsState. Hay varios tipos
 * de tests que podemos hacer:
 * 
 * 1. TESTS UNITARIOS: Verifican que cada función individual funcione correctamente
 *    - Inicialización del estado
 *    - setFlags con diferentes configuraciones
 *    - setFlag para flags individuales
 * 
 * 2. TESTS DE INTEGRACIÓN: Verifican que las funciones trabajen bien juntas
 *    - Combinar setFlags y setFlag
 *    - Verificar que el estado se mantenga consistente
 * 
 * 3. TESTS DE COMPORTAMIENTO: Verifican casos de uso reales
 *    - Reset automático vs manual
 *    - Actualizaciones múltiples
 *    - Edge cases (casos límite)
 * 
 * Para testear hooks de React, usamos renderHook de @testing-library/react
 * que nos permite ejecutar el hook en un entorno controlado.
 * 
 * ============================================================================
 * ¿CUÁNDO MOCKEAR setFlags o setFlag?
 * ============================================================================
 * 
 * REGLA GENERAL: NO deberías mockear setFlags o setFlag porque:
 * - Son parte de lo que estás probando (API pública del hook)
 * - No tienen dependencias externas que necesiten ser mockeadas
 * - Mockearlas haría que tus tests sean menos útiles
 * 
 * CUÁNDO SÍ usar SPIES (no mocks completos):
 * - Para verificar que se llaman con parámetros específicos
 * - Para contar cuántas veces se llaman
 * - Cuando pruebas componentes que usan el hook (no el hook en sí)
 * 
 * CUÁNDO SÍ mockear (si el hook tuviera dependencias externas):
 * - Si setFlags o setFlag llamaran a APIs externas
 * - Si tuvieran efectos secundarios complejos (logs, analytics, etc.)
 * - Si dependieran de servicios externos que quieras aislar
 * 
 * En este caso, como el hook solo usa useState de React, NO necesitamos mocks.
 */

describe('useFlagsState - Tests Básicos de Inicialización', () => {
  /**
   * Este grupo de tests verifica que el hook se inicialice correctamente
   * con diferentes estados iniciales.
   */

  it('debe inicializar el estado con los valores proporcionados', () => {
    // Arrange (Preparar): Definimos el estado inicial
    const initialState = COMMON_INITIAL_STATES.loadingStates

    // Act (Actuar): Ejecutamos el hook usando renderHook
    const { result } = renderHook(() => useFlagsState(initialState))

    // Assert (Afirmar): Verificamos que el estado inicial sea correcto
    expect(result.current.flags).toEqual(initialState)
  })

  it('debe inicializar con un objeto vacío si se proporciona', () => {
    // Test para verificar que funciona incluso con un objeto vacío
    const initialState = {}
    const { result } = renderHook(() => useFlagsState(initialState))

    expect(result.current.flags).toEqual({})
  })

  it('debe inicializar con un solo flag', () => {
    // Test para el caso más simple: un solo flag
    const initialState = { isActive: true }
    const { result } = renderHook(() => useFlagsState(initialState))

    expect(result.current.flags).toEqual({ isActive: true })
  })
})

describe('useFlagsState - Tests de setFlags con Reset (comportamiento por defecto)', () => {
  /**
   * Este grupo de tests verifica el comportamiento de setFlags cuando reset=true
   * (que es el valor por defecto). Cuando reset=true, los flags no especificados
   * deben volver a sus valores iniciales.
   */

  it('debe resetear flags no especificados a sus valores iniciales por defecto', () => {
    // Arrange: Estado inicial con varios flags
    const initialState = COMMON_INITIAL_STATES.loadingStates

    const { result } = renderHook(() => useFlagsState(initialState))

    // Act: Cambiamos todos los flags primero
    act(() => {
      result.current.setFlags({
        isLoading: true,
        isOpen: false,
        isVisible: true
      })
    })

    // Verificamos que todos cambiaron
    expect(result.current.flags).toEqual({
      isLoading: true,
      isOpen: false,
      isVisible: true
    })

    // Act: Ahora solo actualizamos uno, los demás deben resetearse
    act(() => {
      result.current.setFlags({
        isLoading: false
      })
    })

    // Assert: isLoading cambió, pero isOpen e isVisible volvieron a sus valores iniciales
    expect(result.current.flags).toEqual({
      isLoading: false, // El que especificamos
      isOpen: true,     // Reseteado a su valor inicial
      isVisible: false  // Reseteado a su valor inicial
    })
  })

  it('debe resetear cuando reset=true se pasa explícitamente', () => {
    // Test para verificar que funciona igual cuando pasamos reset=true explícitamente
    const initialState = COMMON_INITIAL_STATES.mixedFlags
    const { result } = renderHook(() => useFlagsState(initialState))

    act(() => {
      result.current.setFlags({ flag1: false, flag2: true })
    })

    act(() => {
      result.current.setFlags({ flag1: true }, true) // reset=true explícito
    })

    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: false // Reseteado porque no lo especificamos
    })
  })

  it('debe actualizar múltiples flags y resetear los demás', () => {
    // Test para verificar actualización de múltiples flags a la vez
    const initialState = {
      a: true,
      b: false,
      c: true,
      d: false
    }

    const { result } = renderHook(() => useFlagsState(initialState))

    act(() => {
      result.current.setFlags({ a: false, c: false })
    })

    expect(result.current.flags).toEqual({
      a: false,  // Actualizado
      b: false,  // Reseteado (valor inicial)
      c: false,  // Actualizado
      d: false   // Reseteado (valor inicial)
    })
  })
})

describe('useFlagsState - Tests de setFlags sin Reset', () => {
  /**
   * Este grupo de tests verifica el comportamiento de setFlags cuando reset=false.
   * Cuando reset=false, solo se actualizan los flags especificados y los demás
   * mantienen su valor actual.
   */

  it('debe mantener los valores actuales de flags no especificados cuando reset=false', () => {
    const initialState = COMMON_INITIAL_STATES.loadingStates

    const { result } = renderHook(() => useFlagsState(initialState))

    // Primero cambiamos todos los flags
    act(() => {
      result.current.setFlags({
        isLoading: true,
        isOpen: false,
        isVisible: true
      })
    })

    // Ahora solo actualizamos uno con reset=false
    act(() => {
      result.current.setFlags({ isLoading: false }, false)
    })

    // Assert: isLoading cambió, pero los demás mantienen su valor actual
    expect(result.current.flags).toEqual({
      isLoading: false, // El que especificamos
      isOpen: false,    // Mantiene su valor actual (no resetea)
      isVisible: true   // Mantiene su valor actual (no resetea)
    })
  })

  it('debe funcionar correctamente cuando defaultReset=false en el hook', () => {
    // Test para verificar cuando cambiamos el comportamiento por defecto del hook
    const initialState = COMMON_INITIAL_STATES.mixedFlags
    const { result } = renderHook(() => useFlagsState(initialState, false))

    act(() => {
      result.current.setFlags({ flag1: false, flag2: true })
    })

    // Sin especificar reset, debería usar false (el defaultReset)
    act(() => {
      result.current.setFlags({ flag1: true })
    })

    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: true // Mantiene su valor actual porque defaultReset=false
    })
  })
})

describe('useFlagsState - Tests de setFlag (actualización individual)', () => {
  /**
   * Este grupo de tests verifica la función setFlag, que permite actualizar
   * un solo flag sin afectar a los demás. Esta función retorna otra función
   * que puede recibir un valor booleano o una función updater.
   */

  it('debe actualizar un flag individual con un valor booleano', () => {
    const initialState = COMMON_INITIAL_STATES.loadingStates

    const { result } = renderHook(() => useFlagsState(initialState))

    // setFlag retorna una función, así que la llamamos inmediatamente
    act(() => {
      result.current.setFlag('isLoading')(true)
    })

    // Verificamos que solo isLoading cambió
    expect(result.current.flags).toEqual({
      isLoading: true,  // Cambió
      isOpen: true,     // Sin cambios
      isVisible: false  // Sin cambios
    })
  })

  it('debe actualizar un flag individual con una función updater', () => {
    // Test para verificar que funciona con funciones updater (como setState de React)
    const initialState = { isActive: false }
    const { result } = renderHook(() => useFlagsState(initialState))

    // Usamos una función que recibe el valor anterior y retorna el nuevo
    act(() => {
      result.current.setFlag('isActive')(prev => !prev)
    })

    expect(result.current.flags.isActive).toBe(true)

    // Podemos encadenar múltiples actualizaciones
    act(() => {
      result.current.setFlag('isActive')(prev => !prev)
    })

    expect(result.current.flags.isActive).toBe(false)
  })

  it('debe resetear otros flags cuando reset=true (por defecto)', () => {
    // Test importante: verificar que setFlag resetea otros flags cuando reset=true
    const initialState = {
      flag1: true,
      flag2: false,
      flag3: true
    }

    const { result } = renderHook(() => useFlagsState(initialState))

    // Primero cambiamos todos los flags
    act(() => {
      result.current.setFlags({
        flag1: false,
        flag2: true,
        flag3: false
      })
    })

    // Ahora usamos setFlag con reset=true (por defecto)
    act(() => {
      result.current.setFlag('flag2')(false)
    })

    expect(result.current.flags).toEqual({
      flag1: true,  // Reseteado a su valor inicial
      flag2: false, // Actualizado
      flag3: true   // Reseteado a su valor inicial
    })
  })

  it('no debe afectar otros flags cuando reset=false explícitamente', () => {
    // Test para verificar que setFlag solo afecta al flag especificado cuando reset=false
    const initialState = {
      flag1: true,
      flag2: false,
      flag3: true
    }

    const { result } = renderHook(() => useFlagsState(initialState))

    act(() => {
      result.current.setFlag('flag2', false)(true)
    })

    expect(result.current.flags).toEqual({
      flag1: true,  // Sin cambios
      flag2: true,  // Cambió
      flag3: true   // Sin cambios
    })
  })

  it('debe permitir múltiples actualizaciones individuales', () => {
    // Test para verificar que podemos actualizar varios flags individualmente
    const initialState = createFlagState(3, false)

    const { result } = renderHook(() => useFlagsState(initialState))

    act(() => {
      result.current.setFlag('flag1', false)(true)
      result.current.setFlag('flag2', false)(true)
      result.current.setFlag('flag3', false)(true)
    })

    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: true,
      flag3: true
    })
  })

  it('debe resetear otros flags cuando reset=true explícitamente', () => {
    // Test para verificar que setFlag resetea otros flags cuando reset=true explícitamente
    const initialState = {
      flag1: false,
      flag2: true,
      flag3: false
    }

    const { result } = renderHook(() => useFlagsState(initialState))

    // Primero cambiamos todos los flags
    act(() => {
      result.current.setFlags({
        flag1: true,
        flag2: false,
        flag3: true
      })
    })

    // Ahora usamos setFlag con reset=true explícitamente
    act(() => {
      result.current.setFlag('flag2', true)(true)
    })

    expect(result.current.flags).toEqual({
      flag1: false, // Reseteado a su valor inicial
      flag2: true,  // Actualizado
      flag3: false  // Reseteado a su valor inicial
    })
  })

  it('debe respetar defaultReset=false cuando no se especifica reset en setFlag', () => {
    // Test para verificar que setFlag respeta defaultReset cuando no se especifica reset
    const initialState = {
      flag1: false,
      flag2: true,
      flag3: false
    }

    const { result } = renderHook(() => useFlagsState(initialState, false))

    // Primero cambiamos todos los flags
    act(() => {
      result.current.setFlags({
        flag1: true,
        flag2: false,
        flag3: true
      }, false)
    })

    // setFlag sin especificar reset debería usar defaultReset=false
    act(() => {
      result.current.setFlag('flag2')(true)
    })

    expect(result.current.flags).toEqual({
      flag1: true,  // Mantiene su valor actual (no resetea)
      flag2: true,  // Actualizado
      flag3: true   // Mantiene su valor actual (no resetea)
    })
  })
})

describe('useFlagsState - Tests de Integración (combinando funciones)', () => {
  /**
   * Este grupo de tests verifica que las diferentes funciones del hook
   * trabajen bien juntas en escenarios más complejos.
   */

  it('debe combinar setFlags y setFlag correctamente con reset=false', () => {
    const initialState = {
      isLoading: false,
      isOpen: false,
      isVisible: false
    }

    const { result } = renderHook(() => useFlagsState(initialState))

    // Usamos setFlags para actualizar múltiples flags
    act(() => {
      result.current.setFlags({
        isLoading: true,
        isOpen: true
      })
    })

    // Luego usamos setFlag con reset=false para actualizar uno individual sin resetear
    act(() => {
      result.current.setFlag('isVisible', false)(true)
    })

    expect(result.current.flags).toEqual({
      isLoading: true,
      isOpen: true,
      isVisible: true
    })
  })

  it('debe mantener la consistencia después de múltiples operaciones', () => {
    // Test para verificar que el estado se mantiene consistente
    const initialState = COMMON_INITIAL_STATES.threeFlags

    const { result } = renderHook(() => useFlagsState(initialState))

    // Secuencia de operaciones
    act(() => {
      result.current.setFlags({ flag1: true, flag2: true })
    })

    // setFlag con reset=true (por defecto) resetea los demás flags a sus valores iniciales
    act(() => {
      result.current.setFlag('flag3')(true)
    })

    expect(result.current.flags).toEqual({
      flag1: false, // Reseteado a su valor inicial por setFlag (reset=true por defecto)
      flag2: false, // Reseteado a su valor inicial por setFlag (reset=true por defecto)
      flag3: true  // Actualizado por setFlag
    })
  })
})

describe('useFlagsState - Tests de Edge Cases (casos límite)', () => {
  /**
   * Este grupo de tests verifica casos especiales o límite que podrían
   * causar problemas si no se manejan correctamente.
   */

  it('debe manejar actualizaciones con objeto vacío en setFlags', () => {
    // Test para verificar qué pasa cuando pasamos un objeto vacío
    const initialState = { flag1: true, flag2: false }
    const { result } = renderHook(() => useFlagsState(initialState))

    act(() => {
      result.current.setFlags({ flag1: false })
    })

    // Con reset=true (por defecto), debería resetear todos
    act(() => {
      result.current.setFlags({})
    })

    expect(result.current.flags).toEqual(initialState)
  })

  it('debe manejar flags que no existen en el estado inicial', () => {
    // Test para verificar qué pasa si intentamos actualizar un flag que no existe
    // NOTA: El comportamiento actual permite agregar flags nuevos cuando se usa reset=true
    // porque primero resetea los flags del initialState y luego aplica los updates
    const initialState = { flag1: true }
    const { result } = renderHook(() => useFlagsState(initialState))

    // TypeScript debería prevenir esto, pero testearlo es bueno
    act(() => {
      // @ts-expect-error - Intentamos pasar un flag que no existe
      result.current.setFlags({ flag2: true })
    })

    // Comportamiento actual: flag2 se agrega porque reset=true primero resetea initialState
    // y luego aplica los updates, incluyendo flags que no estaban en initialState
    expect(result.current.flags).toHaveProperty('flag2')
    expect((result.current.flags as any).flag2).toBe(true)
    expect(result.current.flags.flag1).toBe(true) // Se resetea a su valor inicial
  })

  it('debe mantener referencias estables de las funciones', () => {
    // Test importante: las funciones retornadas deben mantener la misma referencia
    // para evitar re-renders innecesarios en componentes que las usen
    const initialState = { flag1: false }
    const { result, rerender } = renderHook(() => useFlagsState(initialState))

    const firstSetFlag = result.current.setFlag
    const firstSetFlags = result.current.setFlags

    // Re-renderizamos el hook
    rerender()

    // Las funciones deberían mantener la misma referencia (gracias a useCallback)
    expect(result.current.setFlag).toBe(firstSetFlag)
    expect(result.current.setFlags).toBe(firstSetFlags)
  })

  it('debe verificar llamadas a setFlags usando spy (caso de uso real)', () => {
    // Test para demostrar cuándo usar spies: cuando quieres verificar
    // que una función se llama con parámetros específicos sin cambiar su comportamiento
    // ÚTIL: Cuando pruebas componentes que usan el hook, no el hook en sí
    const initialState = COMMON_INITIAL_STATES.simpleFlags
    const { result } = renderHook(() => useFlagsState(initialState))

    // Crear un spy para verificar las llamadas
    // NOTA: En la práctica, esto es más útil cuando pruebas componentes que usan el hook
    const setFlagsSpy = jest.spyOn(result.current, 'setFlags' as any)
    
    act(() => {
      result.current.setFlags({ flag1: true }, false)
    })

    // Verificar que se llamó con los parámetros correctos
    expect(setFlagsSpy).toHaveBeenCalledTimes(1)
    expect(setFlagsSpy).toHaveBeenCalledWith({ flag1: true }, false)

    // IMPORTANTE: El comportamiento real sigue funcionando (no es un mock completo)
    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: false // Mantiene su valor porque reset=false
    })

    setFlagsSpy.mockRestore()
  })

  it('debe funcionar correctamente con muchos flags', () => {
    // Test de rendimiento/estabilidad con muchos flags
    const initialState = createManyFlagsState(100, false)

    const { result } = renderHook(() => useFlagsState(initialState))

    act(() => {
      result.current.setFlag('flag50')(true)
    })

    expect(result.current.flags.flag50).toBe(true)
    expect(result.current.flags.flag0).toBe(false)
    expect(result.current.flags.flag99).toBe(false)
  })
})

describe('useFlagsState - Tests de Comportamiento con defaultReset', () => {
  /**
   * Este grupo de tests verifica el comportamiento cuando cambiamos
   * el valor por defecto de reset en la inicialización del hook.
   */

  it('debe usar defaultReset=true cuando no se especifica reset en setFlags', () => {
    const initialState = COMMON_INITIAL_STATES.mixedFlags
    const { result } = renderHook(() => useFlagsState(initialState, true))

    act(() => {
      result.current.setFlags({ flag1: false, flag2: true })
    })

    // Sin especificar reset, debería usar true (defaultReset)
    act(() => {
      result.current.setFlags({ flag1: true })
    })

    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: false // Reseteado porque defaultReset=true
    })
  })

  it('debe permitir sobrescribir defaultReset en setFlags', () => {
    // Test para verificar que podemos sobrescribir el defaultReset
    const initialState = COMMON_INITIAL_STATES.mixedFlags
    const { result } = renderHook(() => useFlagsState(initialState, true))

    act(() => {
      result.current.setFlags({ flag1: false, flag2: true })
    })

    // Sobrescribimos el defaultReset pasando false explícitamente
    act(() => {
      result.current.setFlags({ flag1: true }, false)
    })

    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: true // No reseteó porque pasamos reset=false
    })
  })
})

describe('useFlagsState - Tests de Exportación (index.ts)', () => {
  /**
   * Este grupo de tests verifica que la exportación desde index.ts funcione correctamente.
   * Esto asegura que los usuarios puedan importar useFlagsState desde el punto de entrada
   * principal del paquete.
   */

  it('debe exportar useFlagsState correctamente desde index.ts', () => {
    // Verificar que useFlagsState importado desde index.ts es una función
    expect(typeof useFlagsStateFromIndex).toBe('function')
  })

  it('debe funcionar correctamente cuando se importa desde index.ts', () => {
    const initialState = {
      isLoading: false,
      isOpen: true,
      isVisible: false
    }

    // Verificar que el hook funciona correctamente cuando se importa desde index.ts
    const { result } = renderHook(() => useFlagsStateFromIndex(initialState))

    expect(result.current.flags).toEqual(initialState)
    expectHookReturnsFunctions(result)
  })

  it('debe permitir usar todas las funcionalidades cuando se importa desde index.ts', () => {
    const initialState = COMMON_INITIAL_STATES.simpleFlags

    const { result } = renderHook(() => useFlagsStateFromIndex(initialState))

    // Probar setFlags
    act(() => {
      result.current.setFlags({ flag1: true })
    })

    expect(result.current.flags).toEqual({
      flag1: true,
      flag2: false // Reseteado a su valor inicial (reset=true por defecto)
    })

    // Probar setFlag
    act(() => {
      result.current.setFlag('flag2', false)(true)
    })

    expect(result.current.flags).toEqual({
      flag1: true, // Mantiene su valor (reset=false en setFlag)
      flag2: true  // Actualizado
    })
  })
})
