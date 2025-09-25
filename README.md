# useFlags

A React hook for managing multiple boolean flags

[npm](https://www.npmjs.com/package/use-flags-state) | [GitHub](https://github.com/leomoreno99/use-flags-state)

## Installation

```bash
npm install use-flags-state
```

## Examples and Live Demo

You can see the examples and [Live Demo](https://useflags.vercel.app) here.

## Usage

Manage multiple boolean flags in a single state object, with individual and batch updates, and optional reset to initial values.

```jsx
import { useFlagsState } from 'use-flags-state';

const { flags, setFlags, setFlag } = useFlagsState({
  isLoading: false,
  isError: false,
  isSuccess: false,
});
```

## Default behavior (reset=true)

By default, when you update flags with `setFlags()`, all flags not specified in the update are reset to their initial values. This is useful when you want to ensure a clean state for each operation.

```jsx
const { flags, setFlags } = useFlagsState({
  isLoading: false,
  isError: false,
  isSuccess: false,
});

const handleSubmit = async () => {
  setFlags({ isLoading: true }); // isError and isSuccess reset to false
  try {
    await submitData();
    setFlags({ isSuccess: true }); // isLoading and isError reset to false
  } catch (error) {
    setFlags({ isError: true }); // isLoading and isSuccess reset to false
  }
};
```

## Preserve state behavior (reset=false)

When you set `reset=false`, only the flags you specify are updated, while all other flags maintain their current values. This is perfect for complex UIs where you need to preserve existing state.

```jsx
const { flags, setFlags } = useFlagsState({
  isDarkMode: false,
  isModalOpen: false,
  isLoading: false,
}, false); // reset=false

const toggleDarkMode = () => {
  setFlags({ isDarkMode: !flags.isDarkMode }); // Other flags remain unchanged
};

const openModal = () => {
  setFlags({ isModalOpen: true }); // isDarkMode and isLoading remain unchanged
};
```

## Individual flag updates with setFlag

The `setFlag` function allows you to update individual flags without affecting others. This is particularly useful when passing toggle functions as props to child components, such as modals, dropdowns, or any component that needs to control its own visibility state.

```jsx
const { flags, setFlag } = useFlagsState({
  isModalOpen: false,
  isDropdownOpen: false,
  isLoading: false,
});

// Direct value
const openModal = () => setFlag('isModalOpen', true);

// Updater function
const toggleDropdown = () => setFlag('isDropdownOpen', prev => !prev);

// Pass to child components
<Modal isOpen={flags.isModalOpen} onClose={() => setFlag('isModalOpen', false)} />
<Dropdown isOpen={flags.isDropdownOpen} onToggle={setFlag('isDropdownOpen')} />
```

`setFlag` returns a function that behaves like React's `setState`, accepting either a boolean value or an updater function.

### Key benefits of setFlag:

- **Individual updates**: Only the specified flag changes, others remain untouched
- **Component props**: Perfect for passing toggle functions to child components  
- **Flexible API**: Accepts both direct values and updater functions
- **Type safety**: Full TypeScript support with autocomplete for flag names

## API

### `useFlagsState(initialState, reset?)`

#### Parameters:

- `initialState`: Object with the initial boolean flags
- `reset` (optional): Boolean that determines if unspecified flags should reset to their initial values when using `setFlags()`. Default: `true`

#### Returns:

- `flags`: Object with the current boolean flags
- `setFlags`: Function to update multiple flags at once
- `setFlag`: Function to update an individual flag