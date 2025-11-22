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

// Components with Tailwind CSS - each page uses different classes for CSS splitting demo
const HomePage = (): VNode => (
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 border-b-4 border-blue-500 pb-4 mb-8">
      Welcome to My Blog
    </h1>
    <p class="text-gray-600">This is a static site built with @semajsx/ssg</p>
    {/* Unique classes for HomePage */}
    <div class="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
      <p class="text-lg font-semibold">Featured content area</p>
    </div>
  </div>
);

const BlogIndex = ({
  posts,
}: {
  posts: Array<{ slug: string; data: { title: string; date: Date } }>;
}): VNode => (
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Blog Posts</h1>
    {/* Unique classes for BlogIndex */}
    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <p class="text-yellow-700 text-sm">Browse all our blog posts below</p>
    </div>
    <ul class="space-y-4">
      {posts.map((post) => (
        <li
          key={post.slug}
          class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
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
