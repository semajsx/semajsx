/** @jsxImportSource @semajsx/dom */

import { Counter } from "./Counter";

export function App() {
  return (
    <div class="min-h-screen bg-gray-100">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold text-gray-900 border-b-4 border-blue-500 pb-4 mb-8">
          SemaJSX SSG with Tailwind CSS
        </h1>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            What is this?
          </h2>
          <p class="text-gray-600 mb-4">
            This example demonstrates how to use{" "}
            <strong class="text-blue-600">Tailwind CSS</strong> with SemaJSX SSG
            (Static Site Generation) and the Island Architecture.
          </p>
          <p class="text-gray-600">
            The styles are processed by the{" "}
            <code class="bg-gray-100 px-2 py-1 rounded text-sm">
              @tailwindcss/vite
            </code>{" "}
            plugin, which integrates seamlessly with Vite.
          </p>
        </div>

        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          Static Content
        </h2>
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <p class="text-gray-600 mb-4">
            This is <em>static content</em> rendered on the server. It uses
            Tailwind CSS utility classes for styling.
          </p>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-gray-700">
              <span class="text-green-500">&#10003;</span> Fast initial load
            </li>
            <li class="flex items-center gap-2 text-gray-700">
              <span class="text-green-500">&#10003;</span> SEO friendly
            </li>
            <li class="flex items-center gap-2 text-gray-700">
              <span class="text-green-500">&#10003;</span> Tailwind CSS support
            </li>
          </ul>
        </div>

        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          Interactive Island
        </h2>
        <p class="text-gray-500 mb-4">
          The counter below is an interactive island that hydrates on the
          client:
        </p>

        <Counter initial={0} />

        <div class="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
          <ol class="list-decimal list-inside space-y-2 text-gray-600">
            <li>
              Add <code class="bg-gray-100 px-1 rounded">tailwindcss</code> and{" "}
              <code class="bg-gray-100 px-1 rounded">@tailwindcss/vite</code> as
              dependencies
            </li>
            <li>Configure the Tailwind plugin in your Vite config</li>
            <li>
              Import Tailwind in your CSS:{" "}
              <code class="bg-gray-100 px-1 rounded">
                @import "tailwindcss"
              </code>
            </li>
            <li>Use Tailwind utility classes in your components</li>
          </ol>
        </div>

        <footer class="mt-12 py-6 text-center text-gray-500 border-t border-gray-200">
          <p>Built with SemaJSX + Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}
