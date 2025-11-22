/** @jsxImportSource @semajsx/dom */

import { signal } from "@semajsx/signal";
import { island } from "@semajsx/server";

interface CounterProps {
  initial?: number;
}

function CounterComponent({ initial = 0 }: CounterProps) {
  const count = signal(initial);

  return (
    <div class="bg-white rounded-lg shadow-md p-6 my-4">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">
        Interactive Counter
      </h3>
      <div class="flex items-center gap-4">
        <button
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          onClick={() => count.set(count.get() - 1)}
        >
          -
        </button>
        <span class="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
          {count}
        </span>
        <button
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          onClick={() => count.set(count.get() + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

export const Counter = island(CounterComponent);
