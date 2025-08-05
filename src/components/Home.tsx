import { Link } from "./Router";
import BlogLayout from "./BlogLayout";

export default function Home() {
  return (
    <BlogLayout>
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to My Blog</h1>
        <p className="text-xl text-gray-600 mb-8">
          Built with SemaJSX - A signal-based reactive UI framework
        </p>
        <Link 
          href="/posts" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Posts
        </Link>
      </div>
      
      <section className="mt-16">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">About This Blog</h2>
        <p className="text-gray-600 leading-relaxed">
          This is a demonstration of SemaJSX's capabilities, featuring a blog built with Vite's import.meta.glob 
          for dynamic post loading, signal-based routing, and reactive components.
        </p>
      </section>
    </BlogLayout>
  );
}