import { type Plugin } from "vite";
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
export declare const child_process: (config: VitePluginChildProcess) => Plugin;
//# sourceMappingURL=vite-plugin-child-process.d.ts.map