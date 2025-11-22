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

// Components with Tailwind CSS
const HomePage = (): VNode => (
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 border-b-4 border-blue-500 pb-4 mb-8">
      Welcome to My Blog
    </h1>
    <p class="text-gray-600">This is a static site built with @semajsx/ssg</p>
  </div>
);

const BlogIndex = ({
  posts,
}: {
  posts: Array<{ slug: string; data: { title: string; date: Date } }>;
}): VNode => (
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Blog Posts</h1>
    <ul class="space-y-4">
      {posts.map((post) => (
        <li key={post.slug} class="bg-white rounded-lg shadow p-4">
          <a
            href={`/blog/${post.slug}`}
            class="text-blue-600 hover:underline font-medium"
          >
            {post.data.title}
          </a>
          <span class="text-gray-500 ml-2">
            - {post.data.date.toLocaleDateString()}
          </span>
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
  <article class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">{post.data.title}</h1>
    <div class="prose">{content}</div>
  </article>
);

// Create SSG instance with Tailwind
const ssg = createSSG({
  rootDir,
  outDir: "./dist",
  collections: [blog],
  tailwind: true,
  // MDX configuration with custom components
  mdx: {
    components: {
      Callout,
      CodeBlock,
      Counter,
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
