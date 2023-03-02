# vite-plugin-child-process

<!-- generate badge on https://shields.io -->

![npm](https://img.shields.io/npm/v/vite-plugin-child-process) ![GitHub last commit](https://img.shields.io/github/last-commit/krist7599555/vite-plugin-child-process) ![npm](https://img.shields.io/npm/dm/vite-plugin-child-process)

Vite plugin to run command when file change. Useful when script use local binary or have stateful behavior like websocket.

```typescript
// vite.config.js
import { child_process } from 'vite-plugin-child-process'

export default {
  plugins: [
    child_process({
      name: "my-backend-server",
      command: ["node", "./backend_server.js"],
      watch: [/src/, /controller/]
    })
  ]
};
```

## Parameters

```typescript
export interface VitePluginChildProcess {
  /** command name for prefix log ouput @default "untitle" */
  name?: string;
  /** command to run */
  command: string[];
  /** @default 10ms */
  delay?: number;
  /** vite watch file change */
  watch: (RegExp | string)[];
  /** @default true */
  log_enable?: boolean;
}
```

## Environment

this plugin use `debug` module to log, specify environment `DEBUG=` will show stdout/stderr of command. 

```bash
DEBUG=vite:child-process:*
```

## Footnote

PR and issue always wellcome