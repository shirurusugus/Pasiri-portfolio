import { z } from "zod";

// Flexible Image / Media URL validator that supports:
// 1. Relative local paths (e.g. /uploads/media/filename.png)
// 2. Full HTTP/HTTPS URLs (e.g. https://images.unsplash.com/...)
// 3. Data URLs (e.g. data:image/png;base64,...)
// 4. Empty / null strings
export const ImageUrlSchema = z
  .string()
  .refine(
    (val) =>
      !val ||
      val === "" ||
      val.startsWith("/") ||
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("data:image/"),
    { message: "Invalid image path or URL." }
  )
  .optional()
  .nullable()
  .or(z.literal(""));

export const FlexibleUrlSchema = z
  .string()
  .refine(
    (val) =>
      !val ||
      val === "" ||
      val.startsWith("/") ||
      val.startsWith("http://") ||
      val.startsWith("https://") ||
      val.startsWith("mailto:"),
    { message: "Invalid link URL." }
  )
  .optional()
  .nullable()
  .or(z.literal(""));

// ----------------------------------------------------
// AUTH SCHEMAS
// ----------------------------------------------------
export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// ----------------------------------------------------
// CONTACT FORM SCHEMA
// ----------------------------------------------------
export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name is required (at least 2 characters).").max(100),
  email: z.string().email("Please provide a valid email address."),
  subject: z.string().min(3, "Subject is required.").max(150),
  message: z.string().min(10, "Message must be at least 10 characters.").max(3000),
  honeypot: z.string().max(0, "Bot detected.").optional().or(z.literal("")),
});

// ----------------------------------------------------
// PROJECT SCHEMAS
// ----------------------------------------------------
export const ProjectSchema = z.object({
  title: z.string().min(2, "Title is required.").max(200),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  shortSummary: z.string().min(5, "Summary is required.").max(500),
  year: z.coerce.number().int().default(2026),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  team: z.string().max(150).optional().nullable(),
  organization: z.string().max(150).optional().nullable(),
  category: z.string().default("UX/UI Design"),
  tags: z.string().optional().nullable(),
  technologies: z.string().optional().nullable(),
  tools: z.string().optional().nullable(),
  coverImage: ImageUrlSchema,
  galleryImages: z.string().optional().nullable(),
  problem: z.string().optional().nullable(),
  outcomes: z.string().optional().nullable(),
  reflection: z.string().optional().nullable(),
  externalUrl: FlexibleUrlSchema,
  githubUrl: FlexibleUrlSchema,
  relatedActivitySlug: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  sortOrder: z.coerce.number().int().default(0),
  completedAt: z.string().optional().nullable(),
  seoTitle: z.string().max(150).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  rawContent: z.string().optional().nullable(),
});

// ----------------------------------------------------
// ACTIVITY SCHEMAS
// ----------------------------------------------------
export const ActivitySchema = z.object({
  title: z.string().min(2, "Title is required.").max(200),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  shortSummary: z.string().min(5, "Summary is required.").max(500),
  category: z.string().min(2, "Category is required."),
  location: z.string().max(100).optional().nullable(),
  eventDate: z.string().min(1, "Event date is required."),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  organization: z.string().max(150).optional().nullable(),
  role: z.string().max(150).optional().nullable(),
  coverImage: ImageUrlSchema,
  galleryImages: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  outcomes: z.string().optional().nullable(),
  reflection: z.string().optional().nullable(),
  skillsGained: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  externalLinks: z.string().optional().nullable(),
  externalUrl: FlexibleUrlSchema,
  githubUrl: FlexibleUrlSchema,
  attachments: z.string().optional().nullable(),
  certificateUrl: ImageUrlSchema,
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().max(150).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  rawContent: z.string().optional().nullable(),
});

// ----------------------------------------------------
// DIGITAL ART SCHEMAS
// ----------------------------------------------------
export const ArtworkCategorySchema = z.object({
  name: z.string().min(1, "Category name is required.").max(100),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  order: z.coerce.number().int().default(0),
});

export const ArtworkSchema = z.object({
  title: z.string().min(2, "Title is required.").max(200),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  description: z.string().optional().nullable(),
  year: z.coerce.number().int().min(2000).max(2100).default(2026),
  date: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  medium: z.string().default("Digital Painting"),
  software: z.string().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Artwork image is required."),
  thumbnailUrl: ImageUrlSchema,
  videoUrl: z.string().optional().nullable(),
  gallery: z.string().optional().nullable(),
  processImages: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().max(150).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
});

// ----------------------------------------------------
// BLOG POST SCHEMAS
// ----------------------------------------------------
export const BlogPostSchema = z.object({
  title: z.string().min(2, "Title is required.").max(200),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  excerpt: z.string().min(5, "Excerpt is required.").max(500),
  coverImage: ImageUrlSchema,
  author: z.string().default("pasiri"),
  categoryId: z.string().optional().nullable(),
  readingTimeMin: z.coerce.number().int().min(1).default(3),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  seoTitle: z.string().max(150).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  rawContent: z.string().optional().nullable(),
});

// ----------------------------------------------------
// EXPERIENCE SCHEMA
// ----------------------------------------------------
export const ExperienceSchema = z.object({
  title: z.string().min(2, "Title is required.").max(150),
  organization: z.string().min(2, "Organization is required.").max(150),
  location: z.string().max(100).optional().nullable(),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().nullable(),
  present: z.boolean().default(false),
  description: z.string().min(5, "Description is required."),
  tags: z.string().optional().nullable(),
  linkUrl: FlexibleUrlSchema,
  order: z.coerce.number().int().default(0),
  isVisible: z.boolean().default(true),
});

// ----------------------------------------------------
// SKILL & CATEGORY SCHEMAS
// ----------------------------------------------------
export const SkillSchema = z.object({
  name: z.string().min(1, "Skill name is required.").max(100),
  categoryId: z.string().min(1, "Category is required."),
  description: z.string().max(200).optional().nullable(),
  order: z.coerce.number().int().default(0),
  isFeatured: z.boolean().default(false),
});

export const SkillCategorySchema = z.object({
  name: z.string().min(1, "Category name is required.").max(100),
  order: z.coerce.number().int().default(0),
});

// ----------------------------------------------------
// CERTIFICATION SCHEMA
// ----------------------------------------------------
export const CertificationSchema = z.object({
  name: z.string().min(2, "Certification name is required.").max(200),
  issuer: z.string().min(2, "Issuer is required.").max(150),
  issueDate: z.string().min(1, "Issue date is required."),
  expirationDate: z.string().optional().nullable(),
  credentialId: z.string().max(100).optional().nullable(),
  credentialUrl: FlexibleUrlSchema,
  imageUrl: ImageUrlSchema,
  order: z.coerce.number().int().default(0),
  isVisible: z.boolean().default(true),
});

// ----------------------------------------------------
// EDUCATION SCHEMA
// ----------------------------------------------------
export const EducationSchema = z.object({
  institution: z.string().min(2, "Institution name is required.").max(150),
  degree: z.string().min(2, "Degree is required.").max(150),
  field: z.string().min(2, "Field of study is required.").max(150),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  order: z.coerce.number().int().default(0),
});

// ----------------------------------------------------
// PROFILE SCHEMA
// ----------------------------------------------------
export const ProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  headline: z.string().min(2, "Headline is required."),
  bio: z.string().min(10, "Bio is required."),
  philosophy: z.string().optional().nullable(),
  currentFocus: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  avatarUrl: ImageUrlSchema,
  resumeUrl: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  githubUrl: FlexibleUrlSchema,
  linkedinUrl: FlexibleUrlSchema,
  twitterUrl: FlexibleUrlSchema,
  websiteUrl: FlexibleUrlSchema,
  location: z.string().optional().nullable(),
  availableFor: z.string().optional().nullable(),
});

// ----------------------------------------------------
// PROCESS TIMELINE STEP SCHEMA
// ----------------------------------------------------
export const ProcessTimelineStepSchema = z.object({
  stepNumber: z.string().min(1),
  title: z.string().min(1, "Step title is required."),
  description: z.string().min(1, "Step description is required."),
  mediaUrl: z.string().optional().nullable(),
  mediaType: z.enum(["image", "video"]).optional().nullable(),
  quote: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
});

export const ProcessTimelineBlockSchema = z.object({
  title: z.string().default("กระบวนการทำงาน / Process"),
  subtitle: z.string().optional().nullable(),
  steps: z.array(ProcessTimelineStepSchema).min(1, "At least one step is required."),
});
