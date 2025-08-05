import { Link } from "./Router";

export default function BlogLayout({ children }: { children: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              My Blog
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/posts" className="text-gray-600 hover:text-gray-900">
                Posts
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 My Blog. Built with SemaJSX.
        </div>
      </footer>
    </div>
  );
}