import { signal } from "@semajsx/signal";

export default function App() {
  const count = signal(0);

  return (
    <div className="p-4">
      <h1>SemajsX Demo</h1>
      <p>
        A simple demo app using <code>@semajsx/web</code>
      </p>

      <div className="mt-4">
        <button
          onClick={() => {
            count.value++;
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer"
        >
          Count: {count}
        </button>
      </div>

      <div className="text-gray-600">
        <p>Click the button to increment the counter!</p>
      </div>
    </div>
  );
}
