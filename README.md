# Pico

Pico is a React + TypeScript app with a Vite pipeline and Electron desktop shell.

## Install

```bash
npm install
```

## Run (Desktop)

```bash
npm run desktop:dev
```

Starts Vite in development mode and launches Electron through `vite-plugin-electron`.

## Build (Desktop)

```bash
npm run desktop:build
```

Build outputs:

- Web app: `dist/`
- Electron main/preload: `dist-electron/`

## Build + Start Desktop App

```bash
npm run desktop:start
```

## Package Desktop App

```bash
npm run desktop:dist
```

Install icon assets first:

- `build/icons/icon.icns`
- `build/icons/icon.ico`
- `build/icons/icon.png`

See `build/icons/README.md` for icon conversion instructions.

## Web-only Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
