# JSON5 Visualizer

A friendly tool to validate, parse, and visualize JSON5 data.

JSON5 Visualizer lets you paste JSON5 input, validates it in real time, and renders an interactive, collapsible tree of the resulting data. You can also convert JSON5 to standard JSON with a single click.

## Features

- **Real-time validation** — parses your input as you type and shows errors immediately.
- **Interactive tree** — expand/collapse nodes, with type-aware styling for strings, numbers, booleans, null, objects, and arrays.
- **Expand / Collapse all** — quickly open or close the entire tree.
- **Copy values** — copy any node or the full parsed result as standard JSON.
- **Convert to JSON** — transform JSON5 input (comments, trailing commas, unquoted keys, etc.) into standard JSON.
- **Line numbers** — synchronized with the input editor.

## Tech Stack

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [JSON5](https://json5.org/)
- [Motion](https://motion.dev/) for animations
- [lucide-react](https://lucide.dev/) for icons

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the app:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove the `dist/` directory |

## Project Structure

```
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src
    ├── App.tsx            # Main app: input editor + visualizer layout
    ├── main.tsx           # React entry point
    ├── index.css          # Tailwind + global styles
    ├── components
    │   └── JsonTree.tsx   # Recursive JSON tree node renderer
    └── lib
        └── utils.ts       # `cn` class-name helper
```

## License

Apache-2.0
