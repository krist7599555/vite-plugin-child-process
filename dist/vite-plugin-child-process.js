import debug from "debug";
import os from "node:os";
import path from "node:path";
import { debounce, filter, interval, map, Observable, startWith, tap, } from "rxjs";
import { $ } from "zx";
export const child_process = (config) => {
    const _command = config.command;
    const _delay = config?.delay ?? 10;
    const _watch = config?.watch.map((w) => typeof w == "string" ? new RegExp(w) : w);
    const _throw = config?.throw ?? true;
    const log = debug(`vite:child-process:${config.name ?? "untitle"}`);
    log.enabled = config?.log_enable ?? true;
    const log_watcher = log.extend("watcher");
    const old_process = [];
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
            log_watcher("watcher file change", JSON.stringify(_watch.map((r) => `${r}`)));
            if (os.platform() === "win32") {
                log_watcher("patch os === win32 use powershell");
                $.shell = "powershell.exe";
                $.prefix = "";
            }
            const files = new Observable((o) => {
                watcher.on("ready", () => o.next(""));
                watcher.on("change", (id) => o.next(id));
                watcher.on("add", (id) => o.next(id));
            });
            const filechange$ = files.pipe(filter((id) => _watch.some((regex) => regex.test(id))), map((fullpath) => path.relative(path.resolve(), fullpath)), // change to realtive
            debounce(() => interval(_delay)), tap((id) => log_watcher("filechange " + id)), startWith(null));
            filechange$.subscribe(async () => {
                await kill_all_process();
                const local_process = $ `${_command}`;
                old_process.push(local_process);
                local_process.quiet();
                if (!_throw) {
                    local_process.nothrow();
                }
                local_process.stderr.on("data", (s) => log(s.toString().trimEnd()));
                local_process.stderr.on("error", (s) => log(s.toString().trimEnd()));
                local_process.stdout.on("data", (s) => log(s.toString().trimEnd()));
                local_process.stdout.on("error", (s) => log(s.toString().trimEnd()));
            });
        },
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidml0ZS1wbHVnaW4tY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi92aXRlLXBsdWdpbi1jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDekIsT0FBTyxJQUFJLE1BQU0sV0FBVyxDQUFDO0FBRTdCLE9BQU8sRUFDTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixHQUFHLEVBQ0gsVUFBVSxFQUNWLFNBQVMsRUFDVCxHQUFHLEdBQ0osTUFBTSxNQUFNLENBQUM7QUFFZCxPQUFPLEVBQXVCLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQztBQWtCNUMsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBOEIsRUFBVSxFQUFFO0lBQ3RFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDaEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7SUFDbkMsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUNyQyxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3pDLENBQUM7SUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQztJQUVyQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsc0JBQXNCLE1BQU0sQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFFLENBQUMsQ0FBQztJQUNwRSxHQUFHLENBQUMsT0FBTyxHQUFHLE1BQU0sRUFBRSxVQUFVLElBQUksSUFBSSxDQUFDO0lBRXpDLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FB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QjtnQkFFRCxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUM1QyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQzVCLENBQUM7Z0JBQ0YsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FDN0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUM1QixDQUFDO2dCQUNGLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQzVDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FDNUIsQ0FBQztnQkFDRixhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUM3QyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQzVCLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuaW1wb3J0IG9zIGZyb20gXCJub2RlOm9zXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tIFwibm9kZTpzdHJlYW1cIjtcbmltcG9ydCB7XG4gIGRlYm91bmNlLFxuICBmaWx0ZXIsXG4gIGludGVydmFsLFxuICBtYXAsXG4gIE9ic2VydmFibGUsXG4gIHN0YXJ0V2l0aCxcbiAgdGFwLFxufSBmcm9tIFwicnhqc1wiO1xuaW1wb3J0IHsgdHlwZSBQbHVnaW4gfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgdHlwZSBQcm9jZXNzUHJvbWlzZSwgJCB9IGZyb20gXCJ6eFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZpdGVQbHVnaW5DaGlsZFByb2Nlc3Mge1xuICAvKiogY29tbWFuZCBuYW1lIGZvciBwcmVmaXggbG9nIG91cHV0IEBkZWZhdWx0IFwidW50aXRsZVwiICovXG4gIG5hbWU/OiBzdHJpbmc7XG4gIC8qKiBjb21tYW5kIHRvIHJ1biAqL1xuICBjb21tYW5kOiBzdHJpbmdbXTtcbiAgLyoqIEBkZWZhdWx0IDEwbXMgKi9cbiAgZGVsYXk/OiBudW1iZXI7XG4gIC8qKiB2aXRlIHdhdGNoIGZpbGUgY2hhbmdlICovXG4gIHdhdGNoOiAoUmVnRXhwIHwgc3RyaW5nKVtdO1xuICAvKiogQGRlZmF1bHQgdHJ1ZSAqL1xuICBsb2dfZW5hYmxlPzogYm9vbGVhbjtcblxuICAvKiogQGRlZmF1bHQgdHJ1ZSAqL1xuICB0aHJvdz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBjaGlsZF9wcm9jZXNzID0gKGNvbmZpZzogVml0ZVBsdWdpbkNoaWxkUHJvY2Vzcyk6IFBsdWdpbiA9PiB7XG4gIGNvbnN0IF9jb21tYW5kID0gY29uZmlnLmNvbW1hbmQ7XG4gIGNvbnN0IF9kZWxheSA9IGNvbmZpZz8uZGVsYXkgPz8gMTA7XG4gIGNvbnN0IF93YXRjaCA9IGNvbmZpZz8ud2F0Y2gubWFwKCh3KSA9PlxuICAgIHR5cGVvZiB3ID09IFwic3RyaW5nXCIgPyBuZXcgUmVnRXhwKHcpIDogd1xuICApO1xuICBjb25zdCBfdGhyb3cgPSBjb25maWc/LnRocm93ID8/IHRydWU7XG5cbiAgY29uc3QgbG9nID0gZGVidWcoYHZpdGU6Y2hpbGQtcHJvY2Vzczoke2NvbmZpZy5uYW1lID8/IFwidW50aXRsZVwifWApO1xuICBsb2cuZW5hYmxlZCA9IGNvbmZpZz8ubG9nX2VuYWJsZSA/PyB0cnVlO1xuXG4gIGNvbnN0IGxvZ193YXRjaGVyID0gbG9nLmV4dGVuZChcIndhdGNoZXJcIik7XG5cbiAgY29uc3Qgb2xkX3Byb2Nlc3M6IFByb2Nlc3NQcm9taXNlW10gPSBbXTtcbiAgYXN5bmMgZnVuY3Rpb24ga2lsbF9hbGxfcHJvY2VzcygpIHtcbiAgICBmb3IgKGNvbnN0IHBzIG9mIG9sZF9wcm9jZXNzKSB7XG4gICAgICBhd2FpdCBwcy5raWxsKCk7XG4gICAgICBhd2FpdCBwcy5leGl0Q29kZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG5hbWU6IFwidml0ZS1wbHVnaW4tdml0ZS1jaGlsZC1wcm9jZXNzXCIsXG4gICAgZW5mb3JjZTogXCJwb3N0XCIsXG4gICAgYXBwbHk6IFwic2VydmVcIixcbiAgICBhc3luYyBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgIGxvZ193YXRjaGVyKFwiY2xvc2UgYnVuZGxlXCIpO1xuICAgICAgYXdhaXQga2lsbF9hbGxfcHJvY2VzcygpO1xuICAgIH0sXG4gICAgYXN5bmMgY29uZmlndXJlU2VydmVyKHsgd2F0Y2hlciB9KSB7XG4gICAgICBsb2dfd2F0Y2hlcihcInN0YXJ0IGNvbmZpZ3VyZSBzZXJ2ZXJcIik7XG4gICAgICBsb2dfd2F0Y2hlcihcbiAgICAgICAgXCJ3YXRjaGVyIGZpbGUgY2hhbmdlXCIsXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KF93YXRjaC5tYXAoKHIpID0+IGAke3J9YCkpXG4gICAgICApO1xuXG4gICAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgIGxvZ193YXRjaGVyKFwicGF0Y2ggb3MgPT09IHdpbjMyIHVzZSBwb3dlcnNoZWxsXCIpO1xuICAgICAgICAkLnNoZWxsID0gXCJwb3dlcnNoZWxsLmV4ZVwiO1xuICAgICAgICAkLnByZWZpeCA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZpbGVzID0gbmV3IE9ic2VydmFibGU8c3RyaW5nPigobykgPT4ge1xuICAgICAgICB3YXRjaGVyLm9uKFwicmVhZHlcIiwgKCkgPT4gby5uZXh0KFwiXCIpKTtcbiAgICAgICAgd2F0Y2hlci5vbihcImNoYW5nZVwiLCAoaWQpID0+IG8ubmV4dChpZCkpO1xuICAgICAgICB3YXRjaGVyLm9uKFwiYWRkXCIsIChpZCkgPT4gby5uZXh0KGlkKSk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZmlsZWNoYW5nZSQgPSBmaWxlcy5waXBlKFxuICAgICAgICBmaWx0ZXIoKGlkKSA9PiBfd2F0Y2guc29tZSgocmVnZXgpID0+IHJlZ2V4LnRlc3QoaWQpKSksXG4gICAgICAgIG1hcCgoZnVsbHBhdGgpID0+IHBhdGgucmVsYXRpdmUocGF0aC5yZXNvbHZlKCksIGZ1bGxwYXRoKSksIC8vIGNoYW5nZSB0byByZWFsdGl2ZVxuICAgICAgICBkZWJvdW5jZSgoKSA9PiBpbnRlcnZhbChfZGVsYXkpKSxcbiAgICAgICAgdGFwKChpZCkgPT4gbG9nX3dhdGNoZXIoXCJmaWxlY2hhbmdlIFwiICsgaWQpKSxcbiAgICAgICAgc3RhcnRXaXRoKG51bGwpXG4gICAgICApO1xuXG4gICAgICBmaWxlY2hhbmdlJC5zdWJzY3JpYmUoYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBraWxsX2FsbF9wcm9jZXNzKCk7XG4gICAgICAgIGNvbnN0IGxvY2FsX3Byb2Nlc3M6IFByb2Nlc3NQcm9taXNlID0gJGAke19jb21tYW5kfWA7XG4gICAgICAgIG9sZF9wcm9jZXNzLnB1c2gobG9jYWxfcHJvY2Vzcyk7XG5cbiAgICAgICAgbG9jYWxfcHJvY2Vzcy5xdWlldCgpO1xuICAgICAgICBpZiAoIV90aHJvdykge1xuICAgICAgICAgIGxvY2FsX3Byb2Nlc3Mubm90aHJvdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxfcHJvY2Vzcy5zdGRlcnIub24oXCJkYXRhXCIsIChzOiBTdHJlYW0pID0+XG4gICAgICAgICAgbG9nKHMudG9TdHJpbmcoKS50cmltRW5kKCkpXG4gICAgICAgICk7XG4gICAgICAgIGxvY2FsX3Byb2Nlc3Muc3RkZXJyLm9uKFwiZXJyb3JcIiwgKHM6IFN0cmVhbSkgPT5cbiAgICAgICAgICBsb2cocy50b1N0cmluZygpLnRyaW1FbmQoKSlcbiAgICAgICAgKTtcbiAgICAgICAgbG9jYWxfcHJvY2Vzcy5zdGRvdXQub24oXCJkYXRhXCIsIChzOiBTdHJlYW0pID0+XG4gICAgICAgICAgbG9nKHMudG9TdHJpbmcoKS50cmltRW5kKCkpXG4gICAgICAgICk7XG4gICAgICAgIGxvY2FsX3Byb2Nlc3Muc3Rkb3V0Lm9uKFwiZXJyb3JcIiwgKHM6IFN0cmVhbSkgPT5cbiAgICAgICAgICBsb2cocy50b1N0cmluZygpLnRyaW1FbmQoKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59O1xuIl19