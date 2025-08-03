# use-flags-state

A React hook for managing multiple boolean flags in a single state object, with individual and batch updates, and optional reset to initial values.

## Installation

```bash
npm install use-flags-state
```

## Usage

```jsx
import { useFlagsState } from 'use-flags-state';

const { flags, setFlags, setFlag } = useFlagsState({
  isLoading: false,
  isError: false,
  isSuccess: false,
});

const handleClick = async () => {
  setFlags({ isLoading: true });
  try {
    const response = await fetch('/api/endpoint');
    setFlags({ isLoading: false, isSuccess: true });
  } catch (error) {
    setFlags({ isLoading: false, isError: true });
  }
};

return (
  <div>
    <button onClick={handleClick}>Click me</button>
    {flags.isLoading && <div>Loading...</div>}
    {flags.isError && <div>Error!</div>}
    {flags.isSuccess && <div>Success!</div>}
  </div>
);
```

## API

### `useFlagsState`

Facilita el manejo de múltiples **banderas booleanas** en el estado de un componente.
Tiene la capacidad para actualizar cada bandera individualmente o varias al mismo tiempo.

#### Un objeto vacío vuelve todas las banderas a su estado inicial.

---

#### **Parámetros:**

- `initialState`: Objeto con las banderas booleanas iniciales.
- `defaultReset`: Booleano que determina si las banderas que no se actualicen, vuelven a su estado inicial.

---

#### **Retorno:**

- `flags`: Objeto con las banderas booleanas actuales.

- `setFlags`: Función para actualizar **varias** banderas booleanas al mismo tiempo.

- `setFlag`: Función para actualizar una **bandera booleana individualmente**.