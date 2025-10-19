# Blog Posts Collection Test Specification

> Created: 2025-10-15
> Collection: blog-posts
> Total Tests: 47+
> Coverage Target: 90%

## Overview

This specification defines comprehensive test cases for the Blog Posts collection, including rich text content, author relationships, and SEO fields.

---

## 1. Schema Validation Tests (12 tests)

```typescript
describe('Required Fields', () => {
  it('should require title');
  it('should require slug');
  it('should require excerpt');
  it('should require content (Lexical richText)');
  it('should require author relationship');
  it('should require publishedAt date');
});

describe('Optional Fields', () => {
  it('should allow creation without featuredImage');
  it('should allow creation without categories');
  it('should allow creation without tags');
  it('should allow creation without readTime');
  it('should allow creation without SEO group');
  it('should default readTime to "5 min"');
});
```

---

## 2. Hook Tests (6 tests)

```typescript
describe('Slug Auto-Generation', () => {
  it('should auto-generate slug from title', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        title: 'Advanced Marine Navigation Systems',
        excerpt: 'Test excerpt',
        content: generateMockRichText(),
        author: author.id,
        publishedAt: new Date().toISOString(),
      },
    });

    expect(post.slug).toBe('advanced-marine-navigation-systems');
  });

  it('should handle special characters');
  it('should preserve manually provided slug');
});

describe('Slug Uniqueness', () => {
  it('should enforce slug uniqueness');
});

describe('PublishedAt Default', () => {
  it('should default publishedAt to current date', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        content: generateMockRichText(),
        author: author.id,
      },
    });

    const publishedDate = new Date(post.publishedAt);
    const now = new Date();

    expect(publishedDate.toDateString()).toBe(now.toDateString());
  });

  it('should accept manually provided publishedAt');
});
```

---

## 3. Access Control Tests (8 tests)

```typescript
describe('Admin Access', () => {
  it('should allow admin to CRUD all blog posts');
  it('should allow admin to publish blog posts');
});

describe('Author Access', () => {
  it('should allow author to create blog posts', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        title: 'My Post',
        slug: 'my-post',
        excerpt: 'Test',
        content: generateMockRichText(),
        author: author.id,
        publishedAt: new Date().toISOString(),
      },
      user: author,
    });

    expect(post.id).toBeDefined();
  });

  it('should allow author to update their own posts', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
      },
      user: author,
    });

    const updated = await payload.update({
      collection: 'blog-posts',
      id: post.id,
      data: { excerpt: 'Updated excerpt' },
      user: author,
    });

    expect(updated.excerpt).toBe('Updated excerpt');
  });

  it('should block author from updating other authors posts');
  it('should allow author to delete their own posts');
  it('should block author from deleting other authors posts');
});

describe('Public Access', () => {
  it('should allow public to read published posts');
  it('should filter unpublished posts from public');
});
```

---

## 4. Data Validation Tests (15 tests)

```typescript
describe('Title Validation', () => {
  it('should enforce title max length (255)');
  it('should accept title at max length');
});

describe('Excerpt Validation', () => {
  it('should enforce excerpt max length (500)', async () => {
    const author = await createTestUser(payload, 'author');

    await expect(
      payload.create({
        collection: 'blog-posts',
        data: {
          title: 'Test',
          slug: 'test',
          excerpt: 'A'.repeat(501),
          content: generateMockRichText(),
          author: author.id,
          publishedAt: new Date().toISOString(),
        },
      })
    ).rejects.toThrow(/exceeds maximum length/i);
  });

  it('should accept excerpt at max length (500)');
});

describe('Content RichText Validation', () => {
  it('should accept Lexical rich text format', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        title: 'Test',
        slug: 'test',
        excerpt: 'Test excerpt',
        content: generateMockRichText(5),
        author: author.id,
        publishedAt: new Date().toISOString(),
      },
    });

    expect(post.content.root).toBeDefined();
    expect(post.content.root.children).toBeDefined();
  });

  it('should reject invalid Lexical format');
  it('should preserve rich text formatting (headings, lists, links)');
});

describe('Featured Image Validation', () => {
  it('should accept valid image URL', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
        featuredImage: '/media/blog-post-image.jpg',
      },
    });

    expect(post.featuredImage).toBe('/media/blog-post-image.jpg');
  });

  it('should validate image URL format');
});

describe('ReadTime Validation', () => {
  it('should accept readTime format', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
        readTime: '10 min',
      },
    });

    expect(post.readTime).toBe('10 min');
  });

  it('should default to "5 min" if not provided');
});

describe('SEO Fields Validation', () => {
  it('should accept SEO group with all fields', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
        seo: {
          metaTitle: 'Custom Meta Title',
          metaDescription: 'Custom meta description for SEO',
          keywords: 'marine, technology, navigation',
          ogImage: '/media/og-image.jpg',
        },
      },
    });

    expect(post.seo.metaTitle).toBe('Custom Meta Title');
    expect(post.seo.ogImage).toBe('/media/og-image.jpg');
  });

  it('should validate metaDescription length (160 recommended)');
  it('should validate ogImage URL format');
});
```

---

## 5. Relationship Tests (6 tests)

```typescript
describe('Author Relationship', () => {
  it('should create blog post with author relationship', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
      },
    });

    expect(post.author).toBe(author.id);
  });

  it('should resolve author relationship with depth', async () => {
    const author = await createTestUser(payload, 'author');

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
      },
    });

    const postWithAuthor = await payload.findByID({
      collection: 'blog-posts',
      id: post.id,
      depth: 1,
    });

    expect(postWithAuthor.author.email).toBe(author.email);
  });
});

describe('Categories Relationship', () => {
  it('should create blog post with categories (many-to-many)', async () => {
    const author = await createTestUser(payload, 'author');
    const category1 = await payload.create({
      collection: 'categories',
      data: { name: 'Technology', slug: 'technology' },
    });
    const category2 = await payload.create({
      collection: 'categories',
      data: { name: 'Marine', slug: 'marine' },
    });

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
        categories: [category1.id, category2.id],
      },
    });

    expect(post.categories).toHaveLength(2);
  });

  it('should resolve categories with depth');
});

describe('Tags Relationship', () => {
  it('should create blog post with tags (many-to-many)', async () => {
    const author = await createTestUser(payload, 'author');
    const tag1 = await payload.create({
      collection: 'tags',
      data: { name: 'Navigation', slug: 'navigation' },
    });
    const tag2 = await payload.create({
      collection: 'tags',
      data: { name: 'GPS', slug: 'gps' },
    });

    const post = await payload.create({
      collection: 'blog-posts',
      data: {
        ...blogPostFixtures.basicPost(author.id),
        tags: [tag1.id, tag2.id],
      },
    });

    expect(post.tags).toHaveLength(2);
  });

  it('should resolve tags with depth');
});
```

---

## Test Coverage Summary

| Test Category          | Test Count | Status |
|------------------------|-----------|--------|
| Schema Validation      | 12        | ✓      |
| Hook Tests             | 6         | ✓      |
| Access Control         | 8         | ✓      |
| Data Validation        | 15        | ✓      |
| Relationship Tests     | 6         | ✓      |
| **Total**              | **47**    | ✓      |

## Notes

- Content uses Lexical richText editor
- Authors can CRUD their own posts
- Admins can CRUD all posts
- PublishedAt defaults to current date
- ReadTime defaults to "5 min"
- SEO fields are optional but recommended
- Relationships: author (Users), categories, tags
