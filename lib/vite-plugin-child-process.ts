import debug from "debug";
import path from "node:path";
import { Stream } from "node:stream";
import {
  debounce,
  filter,
  interval,
  map,
  Observable,
  startWith,
  tap,
} from "rxjs";
import { type Plugin } from "vite";
import { type ProcessPromise, $ } from "zx";

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

  /** @default true */
  throw?: boolean;
}

export const child_process = (config: VitePluginChildProcess): Plugin => {
  const _command = config.command;
  const _delay = config?.delay ?? 10;
  const _watch = config?.watch.map((w) =>
    typeof w == "string" ? new RegExp(w) : w
  );
  const _throw = config?.throw ?? true;

  const log = debug(`vite:child-process:${config.name ?? "untitle"}`);
  log.enabled = config?.log_enable ?? true;

  const log_watcher = log.extend("watcher");

  const old_process: ProcessPromise[] = [];
  async function kill_all_process() {
    for (const ps of old_process) {
      await ps.kill();
      await ps.exitCode;
    }
  }

  return {
    name: "vite-plugin-vite-child-process",
    enforce: "post",
    apply: "serve",
    async closeBundle() {
      log_watcher("close bundle");
      await kill_all_process();
    },
    async configureServer({ watcher }) {
      log_watcher("start configure server");
      log_watcher(
        "watcher file change",
        JSON.stringify(_watch.map((r) => `${r}`))
      );
      const files = new Observable<string>((o) => {
        watcher.on("ready", () => o.next(""));
        watcher.on("change", (id) => o.next(id));
        watcher.on("add", (id) => o.next(id));
      });

      const filechange$ = files.pipe(
        filter((id) => _watch.some((regex) => regex.test(id))),
        map((fullpath) => path.relative(path.resolve(), fullpath)), // change to realtive
        debounce(() => interval(_delay)),
        tap((id) => log_watcher("filechange " + id)),
        startWith(null)
      );

      filechange$.subscribe(async () => {
        await kill_all_process();
        const local_process: ProcessPromise = $`${_command}`;
        old_process.push(local_process);

        local_process.quiet();
        if (!_throw) {
          local_process.nothrow();
        }

        local_process.stderr.on("data", (s: Stream) =>
          log(s.toString().trimEnd())
        );
        local_process.stderr.on("error", (s: Stream) =>
          log(s.toString().trimEnd())
        );
        local_process.stdout.on("data", (s: Stream) =>
          log(s.toString().trimEnd())
        );
        local_process.stdout.on("error", (s: Stream) =>
          log(s.toString().trimEnd())
        );
      });
    },
  };
};
