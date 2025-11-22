/** @jsxImportSource @semajsx/dom */

import { createSSG, defineCollection, fileSource, z } from "@semajsx/ssg";
import type { VNode } from "@semajsx/core";

// Import MDX components
import { Callout, CodeBlock, Counter } from "./components";

// Get the directory where this script is located
const rootDir = import.meta.dir;

// Define blog collection
const blog = defineCollection({
  name: "blog",
  source: fileSource(
    {
      directory: "content/blog",
    },
    rootDir,
  ),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

// Components
const HomePage = (): VNode => (
  <div>
    <h1>Welcome to My Blog</h1>
    <p>This is a static site built with @semajsx/ssg</p>
  </div>
);

const BlogIndex = ({
  posts,
}: {
  posts: Array<{ slug: string; data: { title: string; date: Date } }>;
}): VNode => (
  <div>
    <h1>Blog Posts</h1>
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <a href={`/blog/${post.slug}`}>{post.data.title}</a>
          <span> - {post.data.date.toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  </div>
);

const BlogPost = ({
  post,
  content,
}: {
  post: { data: { title: string }; body: string };
  content: VNode;
}): VNode => (
  <article>
    <h1>{post.data.title}</h1>
    <div>{content}</div>
  </article>
);

// Create SSG instance
const ssg = createSSG({
  rootDir,
  outDir: "./dist",
  collections: [blog],
  // MDX configuration with custom components
  mdx: {
    components: {
      Callout: Callout as (props: Record<string, unknown>) => VNode,
      CodeBlock: CodeBlock as (props: Record<string, unknown>) => VNode,
      Counter: Counter as (props: Record<string, unknown>) => VNode,
    },
  },
  routes: [
    {
      path: "/",
      component: HomePage,
      props: { title: "Home" },
    },
    {
      path: "/blog",
      component: BlogIndex as (props: Record<string, unknown>) => VNode,
      props: async (ssg) => ({
        title: "Blog",
        posts: await ssg.getCollection("blog"),
      }),
    },
    {
      path: "/blog/:slug",
      component: BlogPost as (props: Record<string, unknown>) => VNode,
      getStaticPaths: async (ssg) => {
        const posts = await ssg.getCollection("blog");
        return Promise.all(
          posts.map(async (post) => {
            const { Content } = await post.render();
            return {
              params: { slug: post.slug },
              props: { post, content: Content(), title: post.data.title },
            };
          }),
        );
      },
    },
  ],
});

// Build
async function main() {
  console.log("Building static site...");
  const result = await ssg.build();
  console.log(`Built ${result.paths.length} pages:`);
  console.log(result.stats);
}

main().catch(console.error);
