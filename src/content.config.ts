import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const segment = z.object({
  kind: z.enum(['h1', 'h2', 'h3', 'p', 'form']),
  text: z.string(),
  href: z.string().optional(),
  formId: z.string().optional(),
  parts: z.array(z.object({ text: z.string(), href: z.string().optional() })).optional(),
});

const field = z.object({
  name: z.string(),
  type: z.enum(['text', 'email', 'tel', 'textarea', 'radio', 'checkbox', 'select', 'date', 'note']),
  label: z.string(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.object({
    url: z.string(),
    path: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    layout: z.enum(['home', 'standard', 'ministry', 'kids', 'media', 'blog', 'form']),
    segments: z.array(segment),
    navChrome: z.array(z.string()),
    footerChrome: z.array(segment),
    chromeMismatch: z.boolean(),
    links: z.array(z.object({ label: z.string(), href: z.string() })),
    images: z.array(z.object({ src: z.string(), alt: z.string() })),
    embeds: z.array(z.string()),
    forms: z.array(z.object({
      id: z.string(),
      fields: z.array(field),
      submitLabel: z.string(),
      legend: z.string().optional(),
      successText: z.string().optional(),
      subject: z.string().optional(),
      droppedControls: z.array(z.string()).optional(),
    })),
  }),
});

export const collections = { pages };
