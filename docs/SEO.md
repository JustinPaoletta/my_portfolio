# SEO Setup Guide

This portfolio has been configured with comprehensive SEO support using `react-helmet-async`.

## 📋 Features

- ✅ Dynamic meta tags (title, description, keywords)
- ✅ Open Graph tags for social media sharing (Facebook, LinkedIn)
- ✅ Twitter Card support
- ✅ Canonical URLs
- ✅ Robots meta tags
- ✅ Structured data ready
- ✅ Environment-based configuration

## 🎯 Quick Start

The SEO component is already configured in your app. To customize it for different pages:

### Basic Usage

```tsx
import SEO from '@/components/SEO';

function HomePage() {
  return (
    <>
      <SEO />
      {/* Your page content */}
    </>
  );
}
```

### Custom Page Title

```tsx
<SEO title="About Me" />
// Results in: "About Me | My Portfolio"
```

### Full Customization

```tsx
<SEO
  title="My Projects"
  description="Check out my latest web development projects"
  keywords={['projects', 'portfolio', 'web development']}
  image="/images/projects-og.png"
  type="website"
/>
```

### Blog Post Example

```tsx
<SEO
  title="How to Build a Portfolio with React"
  description="A comprehensive guide to building a modern portfolio website"
  type="article"
  keywords={['react', 'portfolio', 'tutorial']}
  image="/images/blog/portfolio-guide.png"
/>
```

### Custom Canonical URL

```tsx
<SEO title="Contact" canonical="https://yourportfolio.com/contact" />
```

### Noindex Page (e.g., Draft or Private)

```tsx
<SEO title="Draft Project" noindex={true} nofollow={true} />
```

## 📄 Per-Page SEO for Routes

### What is Per-Page SEO?

**Per-page SEO** means customizing meta tags (title, description, keywords, images) for each route/page in your application. Instead of using the same SEO defaults everywhere, you provide unique, page-specific information that:

- **Improves search rankings**: Each page targets relevant keywords
- **Enhances social sharing**: Each page can have its own preview image and description
- **Provides better UX**: Users see clear, relevant page titles in browser tabs and bookmarks
- **Increases click-through rates**: Compelling, unique descriptions encourage clicks from search results

### Current Setup (Single Page)

Currently, your app is a single-page application, so you're using default SEO:

```tsx
// src/App.tsx
function App() {
  return (
    <>
      <SEO /> {/* Uses defaultSEO from src/config/seo.ts */}
      {/* Your content */}
    </>
  );
}
```

### When You Add Routes

If you add routing (e.g., using React Router), you'll want per-page SEO. Here's how:

#### Example 1: Using React Router

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SEO from '@/components/SEO';

// Home page
function HomePage() {
  return (
    <>
      <SEO
        title="Home"
        description="Portfolio of Justin Paoletta - Software Engineer specializing in React and TypeScript"
        keywords={['portfolio', 'software engineer', 'React developer']}
      />
      <h1>Welcome</h1>
      {/* Home content */}
    </>
  );
}

// About page
function AboutPage() {
  return (
    <>
      <SEO
        title="About"
        description="Learn about my background, skills, and experience as a software engineer"
        keywords={['about', 'background', 'experience', 'software engineer']}
        canonical="https://jpengineering.dev/about"
      />
      <h1>About Me</h1>
      {/* About content */}
    </>
  );
}

// Projects page
function ProjectsPage() {
  return (
    <>
      <SEO
        title="Projects"
        description="View my portfolio of web development projects built with React, TypeScript, and modern tools"
        keywords={[
          'projects',
          'portfolio',
          'web development',
          'React projects',
        ]}
        image="/images/projects-og.png" // Custom OG image for projects
        canonical="https://jpengineering.dev/projects"
      />
      <h1>My Projects</h1>
      {/* Projects content */}
    </>
  );
}

// Contact page
function ContactPage() {
  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with me for collaboration opportunities or questions about my work"
        keywords={['contact', 'hire', 'collaboration', 'software engineer']}
        canonical="https://jpengineering.dev/contact"
      />
      <h1>Contact Me</h1>
      {/* Contact form */}
    </>
  );
}

// Blog post page (dynamic route)
function BlogPostPage({ slug }: { slug: string }) {
  // In a real app, you'd fetch post data
  const post = {
    title: 'How to Build a Portfolio',
    description: 'A guide to building a modern portfolio website',
    image: '/images/blog/portfolio-guide.png',
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        type="article" // Important for blog posts!
        keywords={['blog', 'tutorial', 'web development']}
        image={post.image}
        canonical={`https://jpengineering.dev/blog/${slug}`}
      />
      <article>
        <h1>{post.title}</h1>
        {/* Blog content */}
      </article>
    </>
  );
}

// Main App component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage slug="..." />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### Example 2: Helper Function for Route-Specific SEO

Create a helper to centralize SEO configs:

```tsx
// src/config/pageSEO.ts
import { defaultSEO } from './seo';
import type { SEOConfig } from './seo';

export const pageSEOConfig: Record<string, Partial<SEOConfig>> = {
  home: {
    title: 'Home',
    description: 'Portfolio of Justin Paoletta - Software Engineer',
    keywords: ['portfolio', 'software engineer', 'React developer'],
  },
  about: {
    title: 'About',
    description: 'Learn about my background and experience',
    keywords: ['about', 'background', 'experience'],
    canonical: `${defaultSEO.siteUrl}/about`,
  },
  projects: {
    title: 'Projects',
    description: 'View my web development projects',
    keywords: ['projects', 'portfolio', 'web development'],
    image: '/images/projects-og.png',
    canonical: `${defaultSEO.siteUrl}/projects`,
  },
  contact: {
    title: 'Contact',
    description: 'Get in touch with me',
    keywords: ['contact', 'hire', 'collaboration'],
    canonical: `${defaultSEO.siteUrl}/contact`,
  },
};

// Usage in components
function AboutPage() {
  const seoConfig = pageSEOConfig.about;

  return (
    <>
      <SEO {...seoConfig} />
      <h1>About Me</h1>
    </>
  );
}
```

#### Example 3: Dynamic Routes (Blog, Project Details)

For dynamic routes like `/blog/:slug` or `/projects/:id`:

```tsx
import { useParams } from 'react-router-dom';

function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch post data (from API, CMS, or static files)
  const post = getBlogPost(slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt || post.description}
        type="article"
        keywords={post.tags}
        image={post.featuredImage}
        canonical={`https://jpengineering.dev/blog/${slug}`}
      />
      <article>
        <h1>{post.title}</h1>
        {/* Post content */}
      </article>
    </>
  );
}
```

### Best Practices for Per-Page SEO

1. **Always set a unique title** - Helps users identify the page
2. **Write compelling descriptions** - 150-160 characters, include a CTA
3. **Use relevant keywords** - 5-10 keywords specific to that page's content
4. **Set canonical URLs** - Prevents duplicate content issues
5. **Use custom OG images** - Create unique preview images for major pages
6. **Match content to SEO** - Ensure meta tags accurately reflect page content

### SEO Component Props Reference

```tsx
interface SEOProps {
  // Basic
  title?: string; // Page title (will be combined with default)
  description?: string; // Meta description
  keywords?: string[]; // Meta keywords

  // Advanced
  author?: string; // Content author
  image?: string; // OG/Twitter image URL
  siteUrl?: string; // Base site URL
  twitterHandle?: string; // Twitter @handle
  locale?: string; // Language/locale (e.g., 'en_US')
  type?: string; // Open Graph type ('website', 'article', etc.)

  // Special
  canonical?: string; // Canonical URL for this page
  noindex?: boolean; // Prevent search indexing
  nofollow?: boolean; // Prevent link following
}
```

All props are optional - if omitted, defaults from `src/config/seo.ts` are used.

## ⚙️ Configuration

### Default SEO Settings

Edit `src/config/seo.ts` to update default values:

```typescript
export const defaultSEO: SEOConfig = {
  title: 'My Portfolio',
  description: 'My personal portfolio website',
  keywords: ['portfolio', 'web developer', 'React'],
  author: 'Your Name', // ← Update this
  siteUrl: 'https://yourportfolio.com', // ← Update this
  image: '/og-image.png',
  twitterHandle: '@yourusername', // ← Update this
  locale: 'en_US',
  type: 'website',
};
```

### Environment Variables

SEO uses environment variables from `.env`:

```bash
VITE_APP_TITLE=My Portfolio
VITE_APP_DESCRIPTION=My personal portfolio website
```

## 🖼️ Open Graph Images

### Requirements

- **Recommended size**: 1200x630px
- **Min size**: 600x315px
- **Max file size**: < 8MB
- **Format**: JPG, PNG, or WebP

### Create Your OG Image

1. Create an image at `public/og-image.png` (1200x630px)
2. Include:
   - Your name/brand
   - Professional photo (optional)
   - Clean, readable design
   - High contrast

### Tools to Create OG Images

- [Canva](https://www.canva.com/) - Free templates
- [Figma](https://www.figma.com/) - Custom designs
- [og-img.vercel.app](https://og-img.vercel.app/) - Generated images

### Test Your OG Images

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## 🤖 robots.txt

Create `public/robots.txt`:

```txt
# Allow all crawlers
User-agent: *
Allow: /

# Disallow admin or draft pages
Disallow: /admin/
Disallow: /drafts/

# Sitemap location
Sitemap: https://yourportfolio.com/sitemap.xml
```

## 🗺️ Sitemap

For a single-page portfolio, create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourportfolio.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

For multi-page sites, consider using a sitemap generator or package.

## 📊 SEO Best Practices

### 1. Page Titles

- Keep under 60 characters
- Include primary keyword
- Make it unique per page
- Front-load important keywords

```tsx
// ✅ Good
<SEO title="Full Stack Developer Portfolio" />

// ❌ Too long
<SEO title="My Awesome Portfolio Website with All My Projects and Contact Information" />
```

### 2. Meta Descriptions

- 150-160 characters optimal
- Include call-to-action
- Unique per page
- Naturally include keywords

```tsx
// ✅ Good
<SEO description="Experienced React developer specializing in modern web applications. View my projects and get in touch." />

// ❌ Too short
<SEO description="My portfolio." />
```

### 3. Keywords

- 5-10 relevant keywords
- Mix of broad and specific
- Natural language

```tsx
<SEO
  keywords={[
    'full stack developer',
    'React developer',
    'TypeScript',
    'web development',
    'frontend engineer',
  ]}
/>
```

### 4. Images

- Always include alt text
- Optimize file sizes
- Use descriptive filenames
- Create unique OG images for key pages

## 🔍 Testing Your SEO

### Browser DevTools

1. Open DevTools (F12)
2. View `<head>` section
3. Verify meta tags are present

### Online Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Meta Tags Checker](https://metatags.io/)
- [SEO Site Checkup](https://seositecheckup.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

### Manual Testing

```bash
# View rendered HTML
curl https://yourportfolio.com | grep "<meta"
```

## 📱 Social Media Preview

### When Sharing Your Portfolio:

1. **LinkedIn**: Supports Open Graph tags
2. **Twitter**: Uses Twitter Card tags
3. **Facebook**: Uses Open Graph tags
4. **Discord**: Uses Open Graph tags
5. **Slack**: Uses Open Graph tags

All are configured automatically! 🎉

## 🚀 Deployment Checklist

Before deploying:

- [ ] Update `siteUrl` in `src/config/seo.ts`
- [ ] Update `author` name
- [ ] Update `twitterHandle`
- [ ] Create and add OG image (`public/og-image.png`)
- [ ] Create `public/robots.txt`
- [ ] Create `public/sitemap.xml`
- [ ] Update `index.html` base meta tags
- [ ] Test with [Meta Tags Checker](https://metatags.io/)
- [ ] Verify social media previews
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if using)

## 🎓 Advanced: Structured Data

For better search results, consider adding structured data (JSON-LD):

```tsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Your Name',
      url: 'https://yourportfolio.com',
      sameAs: [
        'https://linkedin.com/in/yourusername',
        'https://github.com/yourusername',
      ],
      jobTitle: 'Full Stack Developer',
      worksFor: {
        '@type': 'Organization',
        name: 'Your Company',
      },
    })}
  </script>
</Helmet>;
```

## 📚 Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [MDN SEO Basics](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_SEO)

## 🆘 Troubleshooting

### Meta tags not showing up?

- Ensure `<HelmetProvider>` wraps your app in `main.tsx`
- Check that SEO component is rendered
- Verify no JavaScript errors in console

### Social media not showing preview?

- Clear social media cache
- Use debugging tools (Facebook Debugger, Twitter Validator)
- Ensure OG image is publicly accessible
- Check image meets size requirements

### Search engines not indexing?

- Verify robots.txt allows crawling
- Submit sitemap to Google Search Console
- Check for `noindex` meta tag
- Ensure site is publicly accessible

## 💡 Tips

1. **Update regularly**: Keep content fresh
2. **Performance matters**: Fast sites rank better
3. **Mobile-first**: Ensure mobile responsiveness
4. **Quality content**: Best SEO is great content
5. **Monitor**: Use Google Search Console to track performance
