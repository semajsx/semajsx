/** @jsxImportSource @semajsx/dom */

import { createSSG } from "@semajsx/ssg";
import type { VNode } from "@semajsx/core";

const rootDir = import.meta.dir;

// Components with Tailwind classes
const HomePage = (): VNode => (
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-gray-900 border-b-4 border-blue-500 pb-4 mb-8">
        SSG with Tailwind CSS
      </h1>

      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
        <ul class="space-y-2">
          <li class="flex items-center gap-2 text-gray-700">
            <span class="text-green-500">✓</span> Automatic Tailwind CSS
            integration
          </li>
          <li class="flex items-center gap-2 text-gray-700">
            <span class="text-green-500">✓</span> Virtual CSS file - no
            style.css needed
          </li>
          <li class="flex items-center gap-2 text-gray-700">
            <span class="text-green-500">✓</span> Auto-injected via styles prop
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
        <ol class="list-decimal list-inside space-y-2 text-gray-600">
          <li>
            Set <code class="bg-gray-100 px-1 rounded">tailwind: true</code> in
            config
          </li>
          <li>Tailwind CSS is automatically configured</li>
          <li>Use utility classes in your components</li>
        </ol>
      </div>

      <footer class="mt-12 py-6 text-center text-gray-500 border-t border-gray-200">
        <p>Built with @semajsx/ssg + Tailwind CSS</p>
      </footer>
    </div>
  </div>
);

// Create SSG with Tailwind enabled
const ssg = createSSG({
  rootDir,
  outDir: "./dist",
  tailwind: true,
  routes: [
    {
      path: "/",
      component: HomePage,
      props: { title: "SSG Tailwind Example" },
    },
  ],
});

// Build
async function main() {
  console.log("Building static site with Tailwind CSS...");
  const result = await ssg.build();
  console.log(`Built ${result.paths.length} pages`);
}

main().catch(console.error);
