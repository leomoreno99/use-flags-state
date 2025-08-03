import { useState, useCallback, Dispatch, SetStateAction } from 'react'

type UpdateFlags<T extends Record<string, boolean>> = Partial<Record<keyof T, boolean>>

/**
 * ### `useFlagsState`
 * Facilita el manejo de múltiples **banderas booleanas** en el estado de un componente.
 * Tiene la capacidad para actualizar cada bandera individualmente o varias al mismo tiempo.
 * ### Un objeto vacío vuelve todas las banderas a su estado inicial.
 *
 * ---
 * #### **Parámetros:**
 * - **`initialState`**: Objeto con las banderas booleanas iniciales.
 *
 * ---
 * #### **Retorno:**
 * - **`flags`**: Objeto con las banderas booleanas actuales.
 *
 * - **`setFlags`**: Función para actualizar **varias** banderas booleanas al mismo tiempo.
 *
 * - **`setFlag`**: Función para actualizar una **bandera booleana individualmente**.
 */

export const useFlagsState = <T extends Record<string, boolean>>(
  initialState: T,
  defaultReset: boolean = true
) => {
  const [state, setState] = useState<T>(initialState)

  const setFlags = useCallback(
    (updates: UpdateFlags<T>, reset: boolean = defaultReset) => {
      const newState = reset
        ? {
          ...Object.keys(initialState).reduce((acc, key) => {
            acc[key as keyof T] = initialState[key as keyof T]
            return acc
          }, {} as T),
          ...updates
        }
        : { ...state, ...updates }

      setState(newState)
    },
    [defaultReset, initialState, state]
  )

  const setFlag = useCallback(
    (key: keyof T): Dispatch<SetStateAction<boolean>> =>
      (valueOrUpdater) =>
        setState(prev => ({
          ...prev,
          [key]: typeof valueOrUpdater === 'function'
            ? valueOrUpdater(prev[key])
            : valueOrUpdater,
        })),
    []
  )

  return { flags: state, setFlags, setFlag }
}