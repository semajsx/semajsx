import { Link } from "./Router";
import BlogLayout from "./BlogLayout";

interface PostMetadata {
  title?: string;
  date?: string;
  description?: string;
  [key: string]: any;
}

export default function PostList({ posts }: { posts: Record<string, any> }) {
  const postEntries = Object.entries(posts)
    .map(([path, module]) => {
      const match = path.match(/\/posts\/(.+)\.mdx?$/);
      if (!match) return null;
      
      const slug = match[1];
      const metadata: PostMetadata = module.metadata || {};
      
      return {
        slug,
        path,
        metadata: {
          title: metadata.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          date: metadata.date,
          description: metadata.description,
          ...metadata
        }
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a?.metadata.date || !b?.metadata.date) return 0;
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });

  return (
    <BlogLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Posts</h1>
        
        {postEntries.length === 0 ? (
          <p className="text-gray-600">No posts found.</p>
        ) : (
          <div className="space-y-6">
            {postEntries.map((post) => post && (
              <article key={post.slug} className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {post.metadata.title}
                  </Link>
                </h2>
                
                {post.metadata.date && (
                  <time className="text-sm text-gray-500">
                    {new Date(post.metadata.date).toLocaleDateString()}
                  </time>
                )}
                
                {post.metadata.description && (
                  <p className="mt-2 text-gray-600">{post.metadata.description}</p>
                )}
                
                <Link 
                  href={`/posts/${post.slug}`}
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
}