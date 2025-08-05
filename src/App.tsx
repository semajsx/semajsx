import { Router } from "@/components/Router";
import Home from "@/components/Home";
import PostList from "@/components/PostList";
import BlogPost from "@/components/BlogPost";

// Import all markdown/mdx posts using Vite's glob import
const posts = import.meta.glob("./posts/*.{md,mdx}", { eager: true });

// Store routes globally for useParams
(window as any).__routes = [
  { path: "/", component: Home },
  { path: "/posts", component: () => <PostList posts={posts} /> },
  { path: "/posts/:slug", component: () => <BlogPost posts={posts} /> },
];

export default function App() {
  return (
    <Router
      routes={(window as any).__routes}
    />
  );
}
