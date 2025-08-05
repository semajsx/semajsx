import { useParams } from "./Router";
import BlogLayout from "./BlogLayout";

export default function BlogPost({ posts }: { posts: Record<string, any> }) {
  const { slug } = useParams();
  
  const postModule = Object.entries(posts).find(([path]) => {
    const match = path.match(/\/posts\/(.+)\.mdx?$/);
    return match && match[1] === slug;
  });

  if (!postModule) {
    return (
      <BlogLayout>
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600">The post you're looking for doesn't exist.</p>
        </div>
      </BlogLayout>
    );
  }

  const [, module] = postModule;
  const Post = module.default || module;
  const metadata = module.metadata || {};

  return (
    <BlogLayout>
      <article className="prose prose-lg mx-auto">
        {metadata.title && (
          <h1 className="text-4xl font-bold mb-4">{metadata.title}</h1>
        )}
        {metadata.date && (
          <p className="text-gray-500 mb-8">{new Date(metadata.date).toLocaleDateString()}</p>
        )}
        <Post />
      </article>
    </BlogLayout>
  );
}