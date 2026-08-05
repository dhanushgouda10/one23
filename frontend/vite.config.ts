// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // sockjs-client (used by lib/websocket.ts for the STOMP/SockJS
    // connection) references the bare Node identifier `global` all over
    // its own source — global.document, global.navigator, global.crypto,
    // global.location, global.addEventListener, etc. (see
    // node_modules/sockjs-client/lib/{entry,main,location}.js and
    // lib/utils/{browser,event,browser-crypto}.js) — written assuming a
    // bundler shims `global` the way Webpack used to by default. Vite/
    // esbuild doesn't, so in a real browser `global` is simply an
    // undeclared identifier: the moment sockjs-client's module top-level
    // code runs (lib/entry.js line 9 does this unconditionally), it throws
    // "ReferenceError: global is not defined" before anything that imports
    // it — the /rides and /rides/$groupId routes, via lib/websocket.ts —
    // gets a chance to render.
    //
    // This aliases the identifier `global` to `globalThis`, the actual
    // standard global object every modern browser (and Node, and the
    // Cloudflare Workers runtime) provides. It isn't a Node API polyfill —
    // nothing here shims fs/net/process/Buffer or any other Node core
    // module — every property sockjs-client reads off `global` (document,
    // navigator, crypto, location, addEventListener) already exists on
    // `globalThis` in a real browser, so this just lets the existing
    // browser globals resolve the way the library's own code expects.
    //
    // Both places are needed: `define` covers the production build and
    // the SSR/Workers bundle; `optimizeDeps.*.define` covers `vite dev`'s
    // separate dependency pre-bundling pass, which does NOT inherit the
    // top-level `define` — a well-known Vite gotcha. Without it, this fix
    // silently does nothing in dev mode.
    //
    // Vite 8 replaced esbuild with Rolldown and marked
    // `optimizeDeps.esbuildOptions` deprecated in favor of
    // `optimizeDeps.rolldownOptions`, but as of vite@8.2.0 the replacement
    // isn't a drop-in yet — `optimizeDeps.rolldownOptions.define` isn't
    // even a valid type (tsc rejects it: 'define' does not exist on the
    // OptimizeDeps rolldownOptions shape), and functionally verified doing
    // nothing when force-cast in anyway — the pre-bundled
    // node_modules/.vite/deps/sockjs-client.js chunk still had 43 raw,
    // unreplaced `global.` references with only that set.
    // `optimizeDeps.esbuildOptions.define` still works correctly (0 raw
    // references, confirmed the same way) and is the officially still-
    // supported (if deprecated) path for this exact scenario, so that's
    // what's used here despite the build-time deprecation notice — revisit
    // once Rolldown's dep-optimizer `define` support lands.
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
  },
});
