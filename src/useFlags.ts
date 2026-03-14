import { useState, useCallback, Dispatch, SetStateAction } from 'react'

type UpdateFlags<T extends Record<string, boolean>> = Partial<Record<keyof T, boolean>>

/**
 * #### **Parameters:**
 * - **`initialState`**: Object with the initial boolean flags
 * - **`reset`** (optional): Boolean that determines if unspecified flags should reset to their 
 *   initial values when using `setFlags()`. Default: `true`
 *
 * ---
 * #### **Returns:**
 * - **`flags`**: Object with the current boolean flags
 * 
 * - **`setFlags`**: Function to update multiple flags at once. By default, unspecified flags 
 *   are reset to their initial values unless `reset=false` is passed as second parameter
 * 
 * - **`setFlag`**: Function to update an individual flag. By default, when reset=true,
 *   unspecified flags are reset to their initial values. When reset=false, only the
 *   specified flag is updated. Returns a function that accepts either a boolean value
 *   or an updater function. Accepts an optional second parameter `reset` (defaults to
 *   the hook's `defaultReset` value).
 *
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
    (key: keyof T, reset: boolean = defaultReset): Dispatch<SetStateAction<boolean>> =>
      (valueOrUpdater) =>
        setState(prev => {
          const newValue = typeof valueOrUpdater === 'function'
            ? valueOrUpdater(prev[key])
            : valueOrUpdater

          if (reset) {
            // Resetear todos los flags a sus valores iniciales y luego actualizar el flag especificado
            const resetState = Object.keys(initialState).reduce((acc, k) => {
              acc[k as keyof T] = initialState[k as keyof T]
              return acc
            }, {} as T)
            return {
              ...resetState,
              [key]: newValue
            }
          } else {
            // Solo actualizar el flag especificado sin afectar los demás
            return {
              ...prev,
              [key]: newValue
            }
          }
        }),
    [defaultReset, initialState]
  )

  return { flags: state, setFlags, setFlag }
}