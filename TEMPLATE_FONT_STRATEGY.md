# Template & Font Strategy: Scaling to 100+ Templates with 50+ Fonts

**Document Version:** 1.0
**Last Updated:** November 3, 2025
**Project:** Invoify - Invoice Generator Application
**Purpose:** Comprehensive strategy for implementing 100+ invoice templates with 50+ font options per template

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Template Architecture Strategy](#template-architecture-strategy)
4. [Font Management Strategy](#font-management-strategy)
5. [Database Schema Design](#database-schema-design)
6. [Workflow Diagrams](#workflow-diagrams)
7. [Technology Stack Requirements](#technology-stack-requirements)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)
11. [Best Practices & Guidelines](#best-practices--guidelines)
12. [Cost Analysis](#cost-analysis)
13. [Monitoring & Analytics](#monitoring--analytics)

---

## 1. Executive Summary

### The Challenge
Invoify currently supports 2 invoice templates with limited font options. To compete with market leaders like ReceiptFaker (100+ templates) and MakeReceipt (60+ templates), we need to scale to **100+ templates** with **50+ font choices** per template while maintaining performance, user experience, and code maintainability.

### The Solution
This document outlines a comprehensive 3-phase strategy to achieve this goal through:
- **Template Registry System**: Centralized management of templates with metadata
- **Dynamic Font Loading**: On-demand font loading with intelligent caching
- **Flexible Database Schema**: Support for both SQL and NoSQL approaches
- **Component-Based Architecture**: Reusable template components
- **Progressive Enhancement**: Gradual rollout with performance monitoring

### Key Metrics Target
- **100+ templates** by Month 6
- **50+ fonts** available system-wide
- **< 3 seconds** initial load time
- **< 500ms** template switching time
- **< 100KB** per font file (optimized)
- **95%+ performance score** on Lighthouse

---

## 2. Current State Analysis

### Existing Architecture
Based on the Invoify codebase analysis:

**Current Template Implementation:**
- 2 templates: `template-1` and `template-2`
- Templates are React components in `/components/templates/`
- Styling via Tailwind CSS
- No template registry system
- Hardcoded template selection in UI

**Current Font Implementation:**
- System fonts only (no custom fonts)
- Font family defined in Tailwind config
- No font loading optimization
- No user font selection

**Current Data Storage:**
- LocalStorage for invoice data
- No template metadata storage
- No font preference storage
- No template versioning

### Gap Analysis

| Feature | Current State | Target State | Gap |
|---------|--------------|--------------|-----|
| Template Count | 2 | 100+ | 98 templates |
| Font Options | ~5 system fonts | 50+ custom fonts | 45+ fonts |
| Template Metadata | None | Full registry | Complete system |
| Font Loading | Browser default | Dynamic loading | New infrastructure |
| Database Schema | LocalStorage only | Robust schema | Schema design needed |
| Template Versioning | None | Version control | Versioning system |
| Performance Budget | Not defined | Strict limits | Monitoring needed |

---

## 3. Template Architecture Strategy

### 3.1 Template Registry System

**Concept:** A centralized registry that tracks all available templates with their metadata, configuration, and dependencies.

#### Template Registry Structure

```typescript
// Template Registry Schema
interface TemplateRegistry {
  templates: Template[];
  categories: TemplateCategory[];
  tags: TemplateTag[];
  version: string;
  lastUpdated: Date;
}

interface Template {
  id: string;                    // unique identifier (e.g., "invoice-modern-01")
  name: string;                  // display name (e.g., "Modern Professional")
  slug: string;                  // URL-friendly name
  version: string;               // template version (e.g., "1.2.0")
  category: string;              // category ID
  subcategory?: string;          // optional subcategory
  tags: string[];                // searchable tags

  // Visual & Preview
  thumbnail: string;             // preview image URL
  previewImages: string[];       // multiple preview angles
  description: string;           // user-facing description

  // Technical Details
  componentPath: string;         // path to React component
  cssPath?: string;              // optional custom CSS
  supportedFonts: string[];      // compatible font IDs
  defaultFont: string;           // default font ID

  // Features & Compatibility
  features: TemplateFeature[];   // supported features
  paperSizes: PaperSize[];       // supported paper sizes
  orientations: Orientation[];   // portrait/landscape
  colorSchemes: ColorScheme[];   // available color schemes

  // Metadata
  author: string;                // template creator
  license: string;               // usage license
  isPremium: boolean;            // free vs premium
  popularity: number;            // usage score
  rating: number;                // user rating (0-5)
  downloads: number;             // usage count

  // Status
  status: TemplateStatus;        // active, deprecated, beta
  createdAt: Date;
  updatedAt: Date;
  deprecatedAt?: Date;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

interface TemplateFeature {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

enum TemplateStatus {
  ACTIVE = "active",
  BETA = "beta",
  DEPRECATED = "deprecated",
  ARCHIVED = "archived"
}

enum PaperSize {
  A4 = "a4",
  LETTER = "letter",
  LEGAL = "legal",
  A5 = "a5"
}

enum Orientation {
  PORTRAIT = "portrait",
  LANDSCAPE = "landscape"
}
```

### 3.2 Template Organization Strategy

#### Directory Structure

```
/components/templates/
├── registry/
│   ├── template-registry.json          # Main registry file
│   ├── template-registry.types.ts      # TypeScript types
│   └── template-loader.ts              # Dynamic loader
│
├── categories/
│   ├── modern/                         # Modern designs (30 templates)
│   │   ├── modern-01/
│   │   │   ├── template.tsx
│   │   │   ├── config.json
│   │   │   ├── preview.png
│   │   │   └── README.md
│   │   ├── modern-02/
│   │   └── ...
│   │
│   ├── classic/                        # Classic designs (25 templates)
│   ├── minimalist/                     # Minimalist designs (20 templates)
│   ├── corporate/                      # Corporate designs (15 templates)
│   ├── creative/                       # Creative designs (10 templates)
│   └── industry-specific/              # Industry-specific (varies)
│       ├── construction/
│       ├── healthcare/
│       ├── legal/
│       └── retail/
│
├── shared/
│   ├── components/                     # Reusable components
│   │   ├── InvoiceHeader.tsx
│   │   ├── InvoiceTable.tsx
│   │   ├── InvoiceFooter.tsx
│   │   ├── Logo.tsx
│   │   └── Signature.tsx
│   │
│   ├── layouts/                        # Layout components
│   │   ├── SingleColumn.tsx
│   │   ├── TwoColumn.tsx
│   │   └── ThreeColumn.tsx
│   │
│   └── utils/                          # Template utilities
│       ├── currency-formatters.ts
│       ├── date-formatters.ts
│       └── calculations.ts
│
└── base/
    ├── BaseTemplate.tsx                # Abstract base template
    └── TemplateProps.interface.ts     # Shared props interface
```

### 3.3 Template Categories

Recommended categories with distribution:

| Category | Count | Description | Examples |
|----------|-------|-------------|----------|
| Modern | 30 | Contemporary, clean designs | Geometric shapes, bold typography |
| Classic | 25 | Traditional, professional | Serif fonts, formal layouts |
| Minimalist | 20 | Simple, essential elements only | Lots of whitespace, sans-serif |
| Corporate | 15 | Business-focused, branded | Logo-prominent, professional |
| Creative | 10 | Artistic, unique designs | Colorful, unconventional layouts |
| Industry-Specific | 10 | Tailored to specific industries | Construction, healthcare, legal |

**Total:** 110 templates

### 3.4 Template Component Structure

#### Base Template Interface

```typescript
// Base template props that all templates must accept
interface BaseTemplateProps {
  // Invoice Data
  invoice: InvoiceData;

  // Customization
  font: FontConfig;
  colorScheme: ColorScheme;
  logo?: LogoConfig;
  signature?: SignatureConfig;

  // Layout Options
  paperSize: PaperSize;
  orientation: Orientation;
  margin: MarginConfig;

  // Feature Flags
  showTaxBreakdown: boolean;
  showPaymentTerms: boolean;
  showNotes: boolean;
  showDiscounts: boolean;

  // Localization
  locale: string;
  currency: string;
  dateFormat: string;

  // Rendering Mode
  mode: 'preview' | 'pdf' | 'print';
}

// Example template implementation
import { BaseTemplate } from '@/components/templates/base/BaseTemplate';

export class ModernTemplate01 extends BaseTemplate {
  static metadata = {
    id: 'modern-01',
    name: 'Modern Professional',
    category: 'modern',
    version: '1.0.0'
  };

  render() {
    const { invoice, font, colorScheme } = this.props;

    return (
      <div className={`template-modern-01 font-${font.id}`}>
        <TemplateHeader invoice={invoice} colorScheme={colorScheme} />
        <TemplateBody invoice={invoice} />
        <TemplateFooter invoice={invoice} />
      </div>
    );
  }
}
```

### 3.5 Template Lazy Loading Strategy

```typescript
// Dynamic template loader
class TemplateLoader {
  private cache: Map<string, React.ComponentType> = new Map();

  async loadTemplate(templateId: string): Promise<React.ComponentType> {
    // Check cache first
    if (this.cache.has(templateId)) {
      return this.cache.get(templateId)!;
    }

    // Load template dynamically
    const template = await import(
      `@/components/templates/categories/${templateId}/template.tsx`
    );

    // Cache for future use
    this.cache.set(templateId, template.default);

    return template.default;
  }

  preloadTemplate(templateId: string): void {
    // Preload in background
    this.loadTemplate(templateId).catch(console.error);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

---

## 4. Font Management Strategy

### 4.1 Font Library Architecture

#### Font Registry Structure

```typescript
interface FontRegistry {
  fonts: FontDefinition[];
  families: FontFamily[];
  categories: FontCategory[];
  version: string;
}

interface FontDefinition {
  id: string;                      // unique ID (e.g., "roboto")
  name: string;                    // display name (e.g., "Roboto")
  family: string;                  // font family name
  category: FontCategory;          // serif, sans-serif, etc.

  // Variants
  variants: FontVariant[];         // available weights/styles
  defaultVariant: string;          // default weight

  // Files
  files: {
    [variant: string]: {
      woff2: string;                // WOFF2 URL (primary)
      woff: string;                 // WOFF URL (fallback)
      ttf?: string;                 // TTF URL (optional)
    }
  };

  // Metadata
  designer: string;
  license: string;                 // OFL, Apache, Commercial
  isPremium: boolean;

  // Technical
  unicodeRanges: string[];         // supported character sets
  features: OpenTypeFeature[];     // OpenType features
  fileSize: {                      // file sizes in KB
    [variant: string]: number;
  };

  // Display
  preview: string;                 // preview image URL
  sampleText: string;              // preview text

  // Usage
  popularity: number;
  downloads: number;
  rating: number;

  // Compatibility
  browserSupport: BrowserSupport;
  pdfCompatible: boolean;

  // Status
  status: FontStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface FontVariant {
  id: string;                      // e.g., "regular", "700", "italic"
  weight: number;                  // 100-900
  style: 'normal' | 'italic' | 'oblique';
  display: string;                 // display name
}

enum FontCategory {
  SERIF = "serif",
  SANS_SERIF = "sans-serif",
  MONOSPACE = "monospace",
  HANDWRITING = "handwriting",
  DISPLAY = "display"
}

enum FontStatus {
  ACTIVE = "active",
  BETA = "beta",
  DEPRECATED = "deprecated"
}

interface OpenTypeFeature {
  tag: string;                     // e.g., "liga", "kern"
  name: string;
  description: string;
}
```

### 4.2 Font Categories & Distribution

Recommended font distribution across 50+ fonts:

| Category | Count | Purpose | Examples |
|----------|-------|---------|----------|
| Sans-Serif (Professional) | 15 | Body text, modern look | Roboto, Inter, Open Sans |
| Serif (Classic) | 12 | Traditional documents | Merriweather, Lora, Crimson |
| Monospace (Technical) | 5 | Invoice numbers, codes | Roboto Mono, Fira Code |
| Display (Headings) | 10 | Headers, titles | Poppins, Montserrat, Raleway |
| Handwriting (Signature) | 5 | Signatures, notes | Dancing Script, Pacifico |
| Condensed (Space-saving) | 5 | Data-heavy invoices | Roboto Condensed |

**Total:** 52 fonts

### 4.3 Font Loading Strategy

#### Approach 1: Self-Hosted Fonts (Recommended)

**Advantages:**
- Complete control over font files
- No external dependencies
- GDPR compliant (no Google servers)
- Faster loading (same origin)
- Works offline

**Directory Structure:**

```
/public/fonts/
├── roboto/
│   ├── roboto-regular.woff2
│   ├── roboto-regular.woff
│   ├── roboto-700.woff2
│   ├── roboto-700.woff
│   └── metadata.json
├── inter/
├── merriweather/
└── font-manifest.json
```

#### Font Loading Implementation

```typescript
// Font loader service
class FontLoader {
  private loadedFonts: Set<string> = new Set();
  private loading: Map<string, Promise<void>> = new Map();

  async loadFont(fontId: string, variants: string[] = ['regular']): Promise<void> {
    const cacheKey = `${fontId}-${variants.join('-')}`;

    // Already loaded
    if (this.loadedFonts.has(cacheKey)) {
      return;
    }

    // Currently loading
    if (this.loading.has(cacheKey)) {
      return this.loading.get(cacheKey);
    }

    // Start loading
    const loadPromise = this._loadFontInternal(fontId, variants);
    this.loading.set(cacheKey, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.add(cacheKey);
    } finally {
      this.loading.delete(cacheKey);
    }
  }

  private async _loadFontInternal(fontId: string, variants: string[]): Promise<void> {
    // Get font metadata
    const font = await this.getFontMetadata(fontId);

    // Load each variant
    const loadPromises = variants.map(variant => {
      const fontFace = new FontFace(
        font.family,
        `url(/fonts/${fontId}/${fontId}-${variant}.woff2) format('woff2'),
         url(/fonts/${fontId}/${fontId}-${variant}.woff) format('woff')`,
        {
          weight: this.getVariantWeight(variant),
          style: this.getVariantStyle(variant),
          display: 'swap'
        }
      );

      return fontFace.load().then(loadedFace => {
        document.fonts.add(loadedFace);
      });
    });

    await Promise.all(loadPromises);
  }

  preloadFonts(fontIds: string[]): void {
    // Preload fonts in background
    fontIds.forEach(fontId => {
      this.loadFont(fontId, ['regular', '700']).catch(console.error);
    });
  }

  async getFontMetadata(fontId: string): Promise<FontDefinition> {
    const response = await fetch(`/fonts/${fontId}/metadata.json`);
    return response.json();
  }
}

// Usage in React
function InvoiceEditor() {
  const [selectedFont, setSelectedFont] = useState('roboto');
  const fontLoader = useMemo(() => new FontLoader(), []);

  useEffect(() => {
    // Load selected font
    fontLoader.loadFont(selectedFont, ['regular', '700', 'italic']);
  }, [selectedFont, fontLoader]);

  // Preload popular fonts
  useEffect(() => {
    fontLoader.preloadFonts(['roboto', 'inter', 'merriweather']);
  }, [fontLoader]);

  return (
    <div style={{ fontFamily: selectedFont }}>
      {/* Invoice content */}
    </div>
  );
}
```

### 4.4 Font Optimization Techniques

#### Subsetting
Only include characters you need:

```javascript
// Using pyftsubset (Python tool)
pyftsubset Roboto-Regular.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF" \
  --layout-features="liga,kern" \
  --flavor=woff2 \
  --output-file=roboto-regular-subset.woff2
```

**Benefits:**
- Reduces file size by 70-90%
- Example: Roboto Regular 170KB → 30KB (Latin characters only)

#### Font Display Strategy

```css
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto/roboto-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Show fallback font immediately */
}
```

**Font Display Options:**
- `swap`: Show fallback immediately, swap when loaded (RECOMMENDED)
- `optional`: Use font only if cached, otherwise use fallback
- `block`: Hide text briefly, then show font
- `fallback`: Brief hide, then fallback, then font

#### Variable Fonts (Advanced)

```typescript
// Single file for all weights (100-900)
interface VariableFont {
  id: string;
  name: string;
  file: string;          // Single variable font file
  axes: {
    wght: {              // Weight axis
      min: 100,
      max: 900,
      default: 400
    },
    ital: {              // Italic axis
      min: 0,
      max: 1,
      default: 0
    }
  };
  fileSize: number;      // ~60KB for all weights
}
```

**Benefits:**
- One file instead of 6-8 files
- Smooth weight transitions
- Smaller total file size
- Example: Inter Variable ~60KB vs Inter Static ~180KB (6 weights)

### 4.5 Font Fallback Strategy

```typescript
// Font stack with fallbacks
const fontStacks = {
  roboto: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  merriweather: "'Merriweather', Georgia, 'Times New Roman', serif",
  robotoMono: "'Roboto Mono', 'Courier New', Courier, monospace"
};

// CSS generation
function generateFontCSS(fontId: string): string {
  return `
    .font-${fontId} {
      font-family: ${fontStacks[fontId]};
    }
  `;
}
```

---

## 5. Database Schema Design

### 5.1 Schema Option A: PostgreSQL (Recommended for Production)

#### Entity Relationship Diagram (Text Format)

```
┌─────────────────┐       ┌─────────────────┐
│    Templates    │       │   FontRegistry  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ slug            │       │ family          │
│ category_id (FK)│       │ category        │
│ version         │───┐   │ license         │
│ component_path  │   │   │ file_paths      │
│ thumbnail       │   │   │ variants        │
│ metadata        │   │   │ file_size       │
│ supported_fonts │   │   │ status          │
│ default_font_id │   │   │ created_at      │
│ features        │   │   │ updated_at      │
│ status          │   │   └─────────────────┘
│ is_premium      │   │
│ created_at      │   │   ┌─────────────────┐
│ updated_at      │   └───│TemplateFonts    │
└─────────────────┘       ├─────────────────┤
                          │ template_id (FK)│
┌─────────────────┐       │ font_id (FK)    │
│  Categories     │       │ is_default      │
├─────────────────┤       │ created_at      │
│ id (PK)         │       └─────────────────┘
│ name            │
│ slug            │       ┌─────────────────┐
│ description     │       │UserPreferences  │
│ icon            │       ├─────────────────┤
│ order           │       │ id (PK)         │
│ created_at      │       │ user_id (FK)    │
└─────────────────┘       │ favorite_tmpls  │
                          │ favorite_fonts  │
┌─────────────────┐       │ default_tmpl_id │
│     Tags        │       │ default_font_id │
├─────────────────┤       │ settings        │
│ id (PK)         │       │ created_at      │
│ name            │       │ updated_at      │
│ slug            │       └─────────────────┘
│ created_at      │
└─────────────────┘       ┌─────────────────┐
                          │ TemplateUsage   │
┌─────────────────┐       ├─────────────────┤
│  TemplateTags   │       │ id (PK)         │
├─────────────────┤       │ template_id (FK)│
│ template_id (FK)│       │ user_id (FK)    │
│ tag_id (FK)     │       │ used_at         │
│ created_at      │       │ invoice_id      │
└─────────────────┘       └─────────────────┘
```

#### SQL Schema Definition

```sql
-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id),
  version VARCHAR(50) NOT NULL,

  -- Component & Assets
  component_path VARCHAR(500) NOT NULL,
  css_path VARCHAR(500),
  thumbnail VARCHAR(500),
  preview_images TEXT[], -- Array of image URLs

  -- Description & Metadata
  description TEXT,
  author VARCHAR(255),
  license VARCHAR(100),

  -- Features
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  supported_paper_sizes TEXT[] NOT NULL DEFAULT ARRAY['a4', 'letter'],
  supported_orientations TEXT[] NOT NULL DEFAULT ARRAY['portrait'],
  color_schemes JSONB,

  -- Font Configuration
  supported_fonts UUID[] NOT NULL, -- Array of font IDs
  default_font_id UUID REFERENCES font_registry(id),

  -- Status & Permissions
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  is_premium BOOLEAN NOT NULL DEFAULT false,

  -- Metrics
  popularity INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deprecated_at TIMESTAMP,

  -- Indexes
  CONSTRAINT templates_status_check CHECK (status IN ('active', 'beta', 'deprecated', 'archived'))
);

CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_popularity ON templates(popularity DESC);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  parent_id UUID REFERENCES categories(id),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Template Tags (many-to-many)
CREATE TABLE template_tags (
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (template_id, tag_id)
);

-- Font Registry table
CREATE TABLE font_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  family VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,

  -- Files & Variants
  variants JSONB NOT NULL, -- [{id, weight, style, files: {woff2, woff}}]
  default_variant VARCHAR(50) NOT NULL,

  -- Metadata
  designer VARCHAR(255),
  license VARCHAR(100) NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,

  -- Technical
  unicode_ranges TEXT[],
  opentype_features JSONB,
  file_sizes JSONB, -- {variant: size_in_kb}

  -- Assets
  preview_url VARCHAR(500),
  sample_text TEXT,

  -- Compatibility
  browser_support JSONB,
  pdf_compatible BOOLEAN NOT NULL DEFAULT true,

  -- Metrics
  popularity INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT font_category_check CHECK (category IN ('serif', 'sans-serif', 'monospace', 'handwriting', 'display'))
);

CREATE INDEX idx_fonts_category ON font_registry(category);
CREATE INDEX idx_fonts_status ON font_registry(status);
CREATE INDEX idx_fonts_family ON font_registry(family);

-- Template Fonts (many-to-many with metadata)
CREATE TABLE template_fonts (
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  font_id UUID REFERENCES font_registry(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  recommended_for VARCHAR(100), -- 'heading', 'body', 'accent'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (template_id, font_id)
);

-- User Preferences (for future multi-user support)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  favorite_templates UUID[],
  favorite_fonts UUID[],
  default_template_id UUID REFERENCES templates(id),
  default_font_id UUID REFERENCES font_registry(id),
  settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Template Usage Analytics
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id),
  font_id UUID REFERENCES font_registry(id),
  user_id VARCHAR(255),
  invoice_id VARCHAR(255),
  used_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB -- {duration, actions, etc.}
);

CREATE INDEX idx_usage_template ON template_usage(template_id);
CREATE INDEX idx_usage_date ON template_usage(used_at);
CREATE INDEX idx_usage_user ON template_usage(user_id);

-- Template Versions (for version history)
CREATE TABLE template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  component_path VARCHAR(500) NOT NULL,
  changelog TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, version)
);
```

#### Common Queries

```sql
-- Get all active templates in a category with their fonts
SELECT
  t.*,
  c.name as category_name,
  array_agg(DISTINCT f.name) as available_fonts,
  df.name as default_font_name
FROM templates t
JOIN categories c ON t.category_id = c.id
JOIN template_fonts tf ON t.id = tf.template_id
JOIN font_registry f ON tf.font_id = f.id
LEFT JOIN font_registry df ON t.default_font_id = df.id
WHERE t.status = 'active' AND c.slug = 'modern'
GROUP BY t.id, c.name, df.name
ORDER BY t.popularity DESC;

-- Search templates by tag
SELECT t.*
FROM templates t
JOIN template_tags tt ON t.id = tt.template_id
JOIN tags tag ON tt.tag_id = tag.id
WHERE tag.slug IN ('professional', 'minimalist')
AND t.status = 'active';

-- Get most popular templates
SELECT
  t.*,
  c.name as category_name,
  COUNT(tu.id) as usage_count
FROM templates t
JOIN categories c ON t.category_id = c.id
LEFT JOIN template_usage tu ON t.id = tu.template_id
WHERE t.status = 'active'
GROUP BY t.id, c.name
ORDER BY usage_count DESC, t.popularity DESC
LIMIT 10;

-- Get compatible fonts for a template
SELECT f.*
FROM font_registry f
JOIN template_fonts tf ON f.id = tf.font_id
WHERE tf.template_id = 'template-uuid-here'
AND f.status = 'active'
ORDER BY tf.is_default DESC, f.name;
```

### 5.2 Schema Option B: Firebase/Firestore (NoSQL)

#### Collection Structure

```
/templates/{templateId}
  - id: string
  - name: string
  - slug: string
  - categoryId: string
  - version: string
  - componentPath: string
  - thumbnail: string
  - previewImages: string[]
  - description: string
  - author: string
  - license: string
  - features: object[]
  - supportedPaperSizes: string[]
  - supportedOrientations: string[]
  - colorSchemes: object[]
  - supportedFonts: string[]  // Array of font IDs
  - defaultFontId: string
  - status: string
  - isPremium: boolean
  - popularity: number
  - rating: number
  - downloads: number
  - createdAt: timestamp
  - updatedAt: timestamp

  /versions/{versionId}     // Subcollection for versioning
    - version: string
    - componentPath: string
    - changelog: string
    - createdAt: timestamp

  /usage/{usageId}          // Subcollection for analytics
    - userId: string
    - usedAt: timestamp
    - metadata: object

/categories/{categoryId}
  - id: string
  - name: string
  - slug: string
  - description: string
  - icon: string
  - parentId: string | null
  - orderIndex: number
  - createdAt: timestamp

/fonts/{fontId}
  - id: string
  - name: string
  - family: string
  - category: string
  - variants: object[]
  - defaultVariant: string
  - designer: string
  - license: string
  - isPremium: boolean
  - unicodeRanges: string[]
  - opentypeFeatures: object[]
  - fileSizes: object
  - previewUrl: string
  - sampleText: string
  - browserSupport: object
  - pdfCompatible: boolean
  - popularity: number
  - downloads: number
  - rating: number
  - status: string
  - createdAt: timestamp
  - updatedAt: timestamp

/tags/{tagId}
  - id: string
  - name: string
  - slug: string
  - templateIds: string[]    // Denormalized for faster queries
  - createdAt: timestamp

/userPreferences/{userId}
  - userId: string
  - favoriteTemplates: string[]
  - favoriteFonts: string[]
  - defaultTemplateId: string
  - defaultFontId: string
  - settings: object
  - createdAt: timestamp
  - updatedAt: timestamp

/templateUsage/{usageId}
  - templateId: string
  - fontId: string
  - userId: string
  - invoiceId: string
  - usedAt: timestamp
  - metadata: object
```

#### Firestore Indexes

```javascript
// Composite indexes needed
const indexes = [
  {
    collection: 'templates',
    fields: [
      { name: 'status', order: 'ASCENDING' },
      { name: 'categoryId', order: 'ASCENDING' },
      { name: 'popularity', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'templates',
    fields: [
      { name: 'status', order: 'ASCENDING' },
      { name: 'isPremium', order: 'ASCENDING' },
      { name: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'fonts',
    fields: [
      { name: 'category', order: 'ASCENDING' },
      { name: 'status', order: 'ASCENDING' },
      { name: 'name', order: 'ASCENDING' }
    ]
  }
];
```

#### Common Queries (Firestore)

```typescript
// Get active templates in a category
const getTemplatesByCategory = async (categoryId: string) => {
  const templatesRef = collection(db, 'templates');
  const q = query(
    templatesRef,
    where('status', '==', 'active'),
    where('categoryId', '==', categoryId),
    orderBy('popularity', 'desc'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get fonts compatible with a template
const getTemplateFonts = async (templateId: string) => {
  const templateDoc = await getDoc(doc(db, 'templates', templateId));
  const template = templateDoc.data();

  if (!template || !template.supportedFonts) return [];

  // Batch get fonts
  const fontsRef = collection(db, 'fonts');
  const q = query(
    fontsRef,
    where('__name__', 'in', template.supportedFonts),
    where('status', '==', 'active')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Search templates by tags
const searchTemplatesByTags = async (tagSlugs: string[]) => {
  const tagsRef = collection(db, 'tags');
  const tagsQuery = query(tagsRef, where('slug', 'in', tagSlugs));
  const tagsSnapshot = await getDocs(tagsQuery);

  // Get all template IDs from matching tags
  const templateIds = new Set<string>();
  tagsSnapshot.docs.forEach(doc => {
    const tag = doc.data();
    tag.templateIds?.forEach((id: string) => templateIds.add(id));
  });

  // Fetch templates (in batches of 10 - Firestore limit)
  const templateIdsArray = Array.from(templateIds);
  const templates = [];

  for (let i = 0; i < templateIdsArray.length; i += 10) {
    const batch = templateIdsArray.slice(i, i + 10);
    const templatesRef = collection(db, 'templates');
    const q = query(templatesRef, where('__name__', 'in', batch));
    const snapshot = await getDocs(q);
    templates.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  return templates;
};
```

### 5.3 Schema Option C: LocalStorage (Current + Enhanced)

For the current LocalStorage approach, here's how to structure template and font data:

```typescript
// LocalStorage keys
const STORAGE_KEYS = {
  TEMPLATES_REGISTRY: 'invoify_templates_registry',
  FONTS_REGISTRY: 'invoify_fonts_registry',
  USER_PREFERENCES: 'invoify_user_preferences',
  TEMPLATE_USAGE: 'invoify_template_usage',
  INVOICE_DATA: 'invoices' // existing key
};

// Data structures
interface LocalStorageTemplateRegistry {
  version: string;
  lastUpdated: string;
  templates: Template[];
  categories: TemplateCategory[];
}

interface LocalStorageFontRegistry {
  version: string;
  lastUpdated: string;
  fonts: FontDefinition[];
}

interface LocalStorageUserPreferences {
  favoriteTemplates: string[];
  favoriteFonts: string[];
  defaultTemplateId: string;
  defaultFontId: string;
  recentTemplates: string[];
  settings: {
    autoSaveEnabled: boolean;
    defaultPaperSize: string;
    defaultOrientation: string;
  };
}

// Storage manager
class LocalStorageManager {
  private static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }

  static getTemplatesRegistry(): LocalStorageTemplateRegistry | null {
    return this.getItem<LocalStorageTemplateRegistry>(STORAGE_KEYS.TEMPLATES_REGISTRY);
  }

  static setTemplatesRegistry(registry: LocalStorageTemplateRegistry): void {
    this.setItem(STORAGE_KEYS.TEMPLATES_REGISTRY, registry);
  }

  static getFontsRegistry(): LocalStorageFontRegistry | null {
    return this.getItem<LocalStorageFontRegistry>(STORAGE_KEYS.FONTS_REGISTRY);
  }

  static setFontsRegistry(registry: LocalStorageFontRegistry): void {
    this.setItem(STORAGE_KEYS.FONTS_REGISTRY, registry);
  }

  // Query helpers
  static getTemplatesByCategory(categoryId: string): Template[] {
    const registry = this.getTemplatesRegistry();
    if (!registry) return [];

    return registry.templates.filter(
      t => t.category === categoryId && t.status === 'active'
    ).sort((a, b) => b.popularity - a.popularity);
  }

  static getTemplate(templateId: string): Template | null {
    const registry = this.getTemplatesRegistry();
    if (!registry) return null;

    return registry.templates.find(t => t.id === templateId) || null;
  }

  static getFont(fontId: string): FontDefinition | null {
    const registry = this.getFontsRegistry();
    if (!registry) return null;

    return registry.fonts.find(f => f.id === fontId) || null;
  }

  static getCompatibleFonts(templateId: string): FontDefinition[] {
    const template = this.getTemplate(templateId);
    const registry = this.getFontsRegistry();

    if (!template || !registry) return [];

    return registry.fonts.filter(
      f => template.supportedFonts.includes(f.id) && f.status === 'active'
    );
  }
}
```

**Pros:**
- No backend required
- Fast local access
- Works offline
- No costs

**Cons:**
- 5-10 MB storage limit
- Per-browser storage (not synced)
- No server-side analytics
- Manual updates required

---

## 6. Workflow Diagrams

### 6.1 Template Selection Workflow

```
User Opens Invoice Editor
         |
         v
Load Template Registry
         |
         v
Display Template Categories
    - Modern (30)
    - Classic (25)
    - Minimalist (20)
    - Corporate (15)
    - Creative (10)
         |
         v
User Selects Category
         |
         v
Filter & Display Templates
    - Show thumbnails
    - Show ratings
    - Show premium badge
         |
         v
User Hovers Template
         |
         v
Show Quick Preview Modal
    - Larger preview
    - Feature list
    - Compatible fonts
         |
         v
User Clicks "Use Template"
         |
         v
Load Template Component
    ├─> Check if cached
    ├─> If cached: Load from cache
    └─> If not: Dynamic import
         |
         v
Load Default Font
    ├─> Check if font loaded
    └─> Load font files if needed
         |
         v
Apply Template to Invoice
         |
         v
Render Preview
         |
         v
Save Template Selection
    - Update user preferences
    - Track usage analytics
```

### 6.2 Font Selection Workflow

```
User Opens Font Selector
         |
         v
Load Font Registry
         |
         v
Get Compatible Fonts
    - Filter by template support
    - Filter by status (active)
         |
         v
Display Font List
    - Group by category
    - Show preview samples
    - Show loading states
         |
         v
User Searches/Filters
    ├─> By category
    ├─> By name
    └─> By features
         |
         v
Update Font List
         |
         v
User Hovers Font
         |
         v
Show Live Preview
    - Apply to sample text
    - Show all variants
         |
         v
User Selects Font
         |
         v
Check Font Status
    ├─> Already loaded? → Apply immediately
    └─> Not loaded? → Load font
         |
         v
Load Font Files
    ├─> Fetch WOFF2 (primary)
    ├─> Fetch WOFF (fallback)
    └─> Create FontFace objects
         |
         v
Add to Document Fonts
         |
         v
Apply Font to Invoice
         |
         v
Re-render Preview
         |
         v
Save Font Selection
    - Update invoice data
    - Update user preferences
    - Track usage
```

### 6.3 Template Creation Workflow (For Developers)

```
Developer Creates New Template
         |
         v
Step 1: Setup Template Structure
    - Create directory: /components/templates/categories/{category}/{template-id}/
    - Create template.tsx
    - Create config.json
    - Create README.md
         |
         v
Step 2: Implement Template Component
    - Extend BaseTemplate
    - Implement required props
    - Design layout
    - Add responsive styles
         |
         v
Step 3: Create Configuration
    config.json:
    {
      "id": "modern-01",
      "name": "Modern Professional",
      "category": "modern",
      "version": "1.0.0",
      "supportedFonts": ["roboto", "inter", ...],
      "features": [...],
      ...
    }
         |
         v
Step 4: Generate Preview Images
    - Create preview.png (400x600)
    - Create thumbnail.png (200x300)
    - Add to /public/templates/{id}/
         |
         v
Step 5: Update Template Registry
    - Run: npm run build:registry
    - Auto-generates template-registry.json
    - Validates configuration
         |
         v
Step 6: Test Template
    - Test with different fonts
    - Test with different paper sizes
    - Test PDF generation
    - Test print output
         |
         v
Step 7: Add to Database
    - Insert template record
    - Link supported fonts
    - Add tags
    - Set initial metadata
         |
         v
Step 8: Deploy
    - Commit changes
    - Deploy to staging
    - QA testing
    - Deploy to production
         |
         v
Step 9: Monitor
    - Track usage metrics
    - Monitor error rates
    - Collect user feedback
```

### 6.4 Font Addition Workflow (For Developers)

```
Developer Adds New Font
         |
         v
Step 1: License Verification
    - Verify font license
    - Check commercial use allowed
    - Document license terms
         |
         v
Step 2: Font Preparation
    - Download font files (TTF/OTF)
    - Generate web formats:
      └─> WOFF2 (priority)
      └─> WOFF (fallback)
         |
         v
Step 3: Font Optimization
    - Subset characters (Latin, Extended, etc.)
    - Remove unnecessary glyphs
    - Optimize file size
    - Target: <100KB per variant
         |
         v
Step 4: Create Font Package
    /public/fonts/{font-id}/
    ├── {font-id}-regular.woff2
    ├── {font-id}-regular.woff
    ├── {font-id}-700.woff2
    ├── {font-id}-700.woff
    ├── preview.png
    └── metadata.json
         |
         v
Step 5: Create Metadata
    metadata.json:
    {
      "id": "roboto",
      "name": "Roboto",
      "family": "Roboto",
      "category": "sans-serif",
      "variants": [...],
      "license": "Apache 2.0",
      ...
    }
         |
         v
Step 6: Generate Preview
    - Create font preview image
    - Show all variants
    - Show sample text
         |
         v
Step 7: Update Font Registry
    - Run: npm run build:fonts
    - Auto-updates font-registry.json
    - Validates metadata
         |
         v
Step 8: Add to Database
    - Insert font record
    - Set initial metrics
    - Link to compatible templates
         |
         v
Step 9: Test Font
    - Test loading
    - Test rendering
    - Test PDF generation
    - Test browser compatibility
         |
         v
Step 10: Deploy
    - Commit font files
    - Deploy assets
    - Update production registry
```

### 6.5 Template Registry Build Workflow

```
Developer Runs: npm run build:registry
         |
         v
Script Starts
         |
         v
Scan Template Directories
    - Read /components/templates/categories/**
    - Find all config.json files
         |
         v
For Each Template:
    ├─> Parse config.json
    ├─> Validate required fields
    ├─> Check component exists
    ├─> Verify preview images
    └─> Validate font references
         |
         v
Aggregate Template Data
    - Collect all templates
    - Collect all categories
    - Collect all tags
         |
         v
Generate Registry JSON
    {
      "version": "2.1.0",
      "lastUpdated": "2025-11-03",
      "templates": [...],
      "categories": [...],
      "tags": [...]
    }
         |
         v
Write to Output
    - /public/registry/template-registry.json
    - /src/types/template-registry.types.ts
         |
         v
Validation Report
    - Total templates: 110
    - Active templates: 108
    - Beta templates: 2
    - Errors: 0
    - Warnings: 3
         |
         v
Success / Failure
```

### 6.6 User Template Customization Workflow

```
User Selects Template
         |
         v
Template Loaded with Defaults
         |
         v
User Opens Customization Panel
         |
         v
Available Customizations:
    ├─> Font Selection
    ├─> Color Scheme
    ├─> Logo Upload
    ├─> Layout Options
    ├─> Feature Toggles
    └─> Paper Size/Orientation
         |
         v
User Changes Font
         |
         v
Load New Font (if needed)
    └─> Show loading indicator
         |
         v
Apply Font to Preview
    - Update all text elements
    - Maintain layout
    - Re-calculate sizes if needed
         |
         v
User Changes Color Scheme
         |
         v
Apply Color Updates
    - Update primary colors
    - Update accent colors
    - Update backgrounds
         |
         v
Live Preview Updates
    - Debounced rendering (300ms)
    - Smooth transitions
    - Maintain scroll position
         |
         v
User Clicks "Save Customization"
         |
         v
Save to Invoice Data
    {
      ...invoiceData,
      template: {
        id: "modern-01",
        version: "1.0.0",
        customizations: {
          font: "roboto",
          colorScheme: "blue",
          logo: "...",
          ...
        }
      }
    }
         |
         v
Update LocalStorage
         |
         v
Update User Preferences
    - Remember last used font
    - Remember last used template
    - Track favorites
         |
         v
Show Success Message
```

### 6.7 PDF Generation with Custom Template & Font

```
User Clicks "Generate PDF"
         |
         v
Validate Invoice Data
    ├─> Check required fields
    └─> Check template compatibility
         |
         v
Prepare Template Data
    - Template ID
    - Font configuration
    - Color scheme
    - Layout options
         |
         v
Check Font Status
    ├─> Font loaded? → Continue
    └─> Font not loaded? → Load font
         |
         v
Create Puppeteer Instance
    - Launch headless Chrome
    - Set viewport size
    - Configure PDF options
         |
         v
Inject Font Files
    - Load font WOFF2/WOFF
    - Create @font-face rules
    - Add to page <style>
         |
         v
Render Template HTML
    - Server-side render React
    - Apply styles
    - Inject invoice data
         |
         v
Load Page in Puppeteer
    - Navigate to page
    - Wait for fonts loaded
    - Wait for images loaded
         |
         v
Generate PDF
    - Format: A4/Letter
    - Print background graphics
    - Prefer CSS page size
         |
         v
Save/Stream PDF
    ├─> Download to user
    └─> Email attachment (optional)
         |
         v
Clean Up
    - Close Puppeteer
    - Free memory
         |
         v
Track Usage
    - Log template used
    - Log font used
    - Update analytics
         |
         v
Return PDF to User
```

### 6.8 Template Analytics Workflow

```
Background Process (Every Hour)
         |
         v
Query Template Usage
    - Last 24 hours
    - Last 7 days
    - Last 30 days
         |
         v
Calculate Metrics
    For Each Template:
    ├─> Usage count
    ├─> Unique users
    ├─> Avg customization time
    ├─> PDF generation success rate
    ├─> Error rate
    └─> User ratings
         |
         v
Update Template Popularity Score
    Score = (
      (usage_count * 10) +
      (unique_users * 5) +
      (rating * 100) -
      (error_rate * 50)
    )
         |
         v
Update Database
    - Update popularity field
    - Update downloads count
    - Update rating field
         |
         v
Generate Reports
    - Top 10 templates
    - Trending templates
    - Underused templates
    - Error-prone templates
         |
         v
Send Notifications
    - Alert on high error rates
    - Alert on low usage
    - Alert on high demand
         |
         v
Archive Old Data
    - Move to cold storage (>90 days)
    - Keep aggregated metrics
```

---

## 7. Technology Stack Requirements

### 7.1 Core Technologies (Already in Use)

| Technology | Current Version | Purpose | Notes |
|-----------|----------------|---------|-------|
| Next.js | 15.3.3 | Framework | App Router, RSC |
| React | 18.2.0 | UI Library | Already used |
| TypeScript | 5.2.2 | Type Safety | Already used |
| Tailwind CSS | 3.4.1 | Styling | Already used |
| Puppeteer | Core + Chromium | PDF Generation | Already used |

### 7.2 New Technologies Required

#### Font Management

1. **@fontsource/* packages** (Optional)
   - Pre-packaged font files
   - Automatic versioning
   - CDN distribution
   - Example: `@fontsource/roboto`

2. **fontkit**
   - Font file parsing
   - Metadata extraction
   - Subsetting support
   - Used in build process

3. **Font Forge / pyftsubset**
   - Font optimization
   - Character subsetting
   - Format conversion
   - Used in development

#### Template Management

1. **Gray-matter**
   - Parse template metadata
   - Front-matter parsing
   - Used in build scripts

2. **React.lazy + Suspense**
   - Already in React 18
   - Dynamic template loading
   - Code splitting

#### Database (Choose One)

**Option A: PostgreSQL Stack**
- PostgreSQL 15+
- Prisma ORM or Drizzle ORM
- pg (node-postgres driver)

**Option B: Firebase Stack**
- Firebase SDK v10+
- Firestore
- Firebase Storage (for assets)

**Option C: Supabase** (PostgreSQL + APIs)
- Supabase client
- Built-in authentication
- Built-in storage

### 7.3 Development Tools

```json
{
  "devDependencies": {
    "@types/fontkit": "^2.0.0",
    "fontkit": "^2.0.0",
    "gray-matter": "^4.0.3",
    "sharp": "^0.33.0",           // Image processing
    "playwright": "^1.40.0",       // Template testing
    "prisma": "^5.7.0",           // Database ORM (if SQL)
    "zod": "^3.22.4",             // Already used - schema validation
    "tsx": "^4.7.0"               // TypeScript runner for scripts
  }
}
```

### 7.4 Build Scripts

```json
{
  "scripts": {
    "build:registry": "tsx scripts/build-template-registry.ts",
    "build:fonts": "tsx scripts/build-font-registry.ts",
    "build:previews": "tsx scripts/generate-template-previews.ts",
    "optimize:fonts": "tsx scripts/optimize-fonts.ts",
    "validate:templates": "tsx scripts/validate-templates.ts",
    "test:templates": "playwright test templates",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx scripts/seed-database.ts"
  }
}
```

### 7.5 File Storage Options

#### Option A: Local/Server Storage (Current)
- Store in `/public/` directory
- Serve via Next.js static files
- Pros: Simple, no external dependencies
- Cons: Large deploy size, no CDN

#### Option B: CDN Storage (Recommended)
- **Cloudflare R2** (S3-compatible, no egress fees)
- **AWS S3** + CloudFront
- **Vercel Blob Storage**
- Pros: Fast global delivery, scalable
- Cons: Additional cost, complexity

#### Option C: Firebase Storage
- Integrated with Firebase
- Good for Firebase users
- Free tier: 5GB storage, 1GB/day transfer

**Recommendation:** Start with local storage, migrate to CDN when you reach 50+ templates.

### 7.6 Caching Strategy

```typescript
// Service Worker for aggressive caching
// /public/service-worker.js

const CACHE_NAME = 'invoify-v1';
const FONT_CACHE = 'invoify-fonts-v1';
const TEMPLATE_CACHE = 'invoify-templates-v1';

// Cache fonts aggressively (they rarely change)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache fonts for 1 year
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }

  // Cache template previews
  if (url.pathname.startsWith('/templates/')) {
    event.respondWith(
      caches.open(TEMPLATE_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

### 7.7 API Routes Required

```typescript
// /app/api/templates/route.ts
export async function GET(request: Request) {
  // Get all templates with optional filters
}

// /app/api/templates/[id]/route.ts
export async function GET(request: Request, { params }) {
  // Get single template with details
}

// /app/api/fonts/route.ts
export async function GET(request: Request) {
  // Get all fonts
}

// /app/api/fonts/[id]/route.ts
export async function GET(request: Request, { params }) {
  // Get single font with variants
}

// /app/api/templates/[id]/fonts/route.ts
export async function GET(request: Request, { params }) {
  // Get compatible fonts for a template
}

// /app/api/analytics/templates/route.ts
export async function POST(request: Request) {
  // Track template usage
}
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: Architecture Setup
- [ ] Design database schema (SQL or NoSQL)
- [ ] Create TypeScript types and interfaces
- [ ] Set up template registry structure
- [ ] Create font registry structure
- [ ] Design API routes

#### Week 2: Base Infrastructure
- [ ] Implement template loader system
- [ ] Implement font loader system
- [ ] Create base template component
- [ ] Set up dynamic imports
- [ ] Create caching layer

#### Week 3: Registry System
- [ ] Build template registry builder script
- [ ] Build font registry builder script
- [ ] Create validation scripts
- [ ] Set up preview generation
- [ ] Create database seeding scripts

#### Week 4: Core UI Components
- [ ] Template selector component
- [ ] Font selector component
- [ ] Template preview modal
- [ ] Loading states & error boundaries
- [ ] Search and filter components

**Deliverables:**
- Template registry system (10 test templates)
- Font loader (10 test fonts)
- Template/font selector UI
- Database schema implemented

### Phase 2: Content Creation (Weeks 5-16)

#### Weeks 5-8: First 40 Templates
- [ ] Create 15 Modern templates
- [ ] Create 10 Classic templates
- [ ] Create 10 Minimalist templates
- [ ] Create 5 Corporate templates
- [ ] Generate all previews
- [ ] Test on multiple devices

#### Weeks 9-12: Next 40 Templates
- [ ] Create remaining 15 Modern templates
- [ ] Create remaining 15 Classic templates
- [ ] Create remaining 10 Minimalist templates
- [ ] Create remaining 10 Corporate templates
- [ ] Continuous testing

#### Weeks 13-16: Final 30 Templates + Polish
- [ ] Create 10 Creative templates
- [ ] Create 10 Industry-specific templates
- [ ] Create 10 additional popular templates
- [ ] Polish all templates
- [ ] Comprehensive testing

**Deliverables:**
- 110 production-ready templates
- All preview images generated
- All templates tested
- Template documentation

### Phase 3: Fonts & Optimization (Weeks 17-20)

#### Week 17: Font Collection & Preparation
- [ ] License 50+ fonts (or use open-source)
- [ ] Download and organize font files
- [ ] Verify licenses and attribution
- [ ] Create font documentation

#### Week 18: Font Optimization
- [ ] Subset all fonts (Latin, Extended, etc.)
- [ ] Convert to WOFF2/WOFF
- [ ] Optimize file sizes (<100KB target)
- [ ] Generate font previews
- [ ] Update font registry

#### Week 19: Integration
- [ ] Link fonts to templates
- [ ] Test all font-template combinations
- [ ] Implement font loading optimization
- [ ] Add font fallback strategies
- [ ] Test PDF generation with all fonts

#### Week 20: Performance Optimization
- [ ] Implement lazy loading
- [ ] Set up CDN (if using)
- [ ] Configure aggressive caching
- [ ] Optimize bundle size
- [ ] Run Lighthouse audits
- [ ] Fix performance issues

**Deliverables:**
- 50+ optimized fonts
- All fonts linked to templates
- Performance score >90
- CDN configured

### Phase 4: Advanced Features (Weeks 21-24)

#### Week 21: User Experience
- [ ] Template search functionality
- [ ] Template filtering (category, tags, features)
- [ ] Template favorites
- [ ] Recently used templates
- [ ] Template ratings/feedback

#### Week 22: Analytics & Monitoring
- [ ] Implement usage tracking
- [ ] Create analytics dashboard
- [ ] Set up error monitoring
- [ ] Create performance monitoring
- [ ] Set up alerts

#### Week 23: Premium Features
- [ ] Implement premium template system
- [ ] Add template marketplace (optional)
- [ ] Create template bundles
- [ ] Add custom branding options
- [ ] Template customization presets

#### Week 24: Testing & Polish
- [ ] Comprehensive testing (all templates + fonts)
- [ ] Browser compatibility testing
- [ ] Mobile responsiveness testing
- [ ] PDF generation testing
- [ ] Bug fixes and polish
- [ ] Documentation

**Deliverables:**
- Complete template system
- Analytics dashboard
- Premium features (if applicable)
- Full test coverage
- Complete documentation

### Milestones

| Milestone | Week | Description |
|-----------|------|-------------|
| M1: Foundation Complete | 4 | Registry system, core UI, database |
| M2: 40 Templates Live | 8 | First batch of templates |
| M3: 80 Templates Live | 12 | Second batch of templates |
| M4: 110 Templates Live | 16 | All templates complete |
| M5: Fonts Integrated | 20 | All fonts optimized and integrated |
| M6: Launch Ready | 24 | Complete system with all features |

---

## 9. Performance Optimization

### 9.1 Performance Budget

Set strict performance budgets to ensure excellent user experience:

| Metric | Target | Max Acceptable | Notes |
|--------|--------|----------------|-------|
| Initial Load (FCP) | 1.5s | 2.5s | First Contentful Paint |
| Time to Interactive (TTI) | 3.0s | 5.0s | Fully interactive |
| Template Switch | 300ms | 500ms | Switching templates |
| Font Load | 200ms | 400ms | Single font loading |
| PDF Generation | 2s | 5s | Including rendering |
| JavaScript Bundle | 200KB | 300KB | Gzipped |
| Font File Size | 50KB | 100KB | Per variant |
| Template Preview | 50KB | 100KB | Image size |
| Total Page Weight | 1.5MB | 2.5MB | Including fonts |
| Lighthouse Score | 95 | 90 | Overall score |

### 9.2 Bundle Optimization

```javascript
// next.config.js
module.exports = {
  // Optimize JavaScript bundles
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Replace React with Preact in production (optional)
      Object.assign(config.resolve.alias, {
        // Uncomment if using Preact
        // 'react': 'preact/compat',
        // 'react-dom/test-utils': 'preact/test-utils',
        // 'react-dom': 'preact/compat',
      });
    }

    // Bundle analyzer (for debugging)
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html'
        })
      );
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Strict mode
  reactStrictMode: true,

  // Gzip compression
  compress: true,

  // Production optimizations
  swcMinify: true,

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@/components/ui'],
  }
};
```

### 9.3 Code Splitting Strategy

```typescript
// Dynamic imports for templates
const TemplateLoader = dynamic(
  () => import('@/components/templates/loader/TemplateLoader'),
  {
    loading: () => <TemplateSkeleton />,
    ssr: false // Templates don't need SSR
  }
);

// Dynamic imports for heavy components
const FontSelector = dynamic(
  () => import('@/components/ui/FontSelector'),
  {
    loading: () => <FontSelectorSkeleton />
  }
);

// Preload on hover
function TemplateCard({ template }) {
  const handleMouseEnter = () => {
    // Preload template component
    import(`@/components/templates/categories/${template.category}/${template.id}/template`);
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {/* Card content */}
    </div>
  );
}
```

### 9.4 Font Loading Optimization

```typescript
// Priority-based font loading
class PriorityFontLoader {
  private queues = {
    high: [] as string[],
    normal: [] as string[],
    low: [] as string[]
  };

  addToQueue(fontId: string, priority: 'high' | 'normal' | 'low' = 'normal') {
    this.queues[priority].push(fontId);
  }

  async processQueue() {
    // Load high priority fonts first
    await this.loadBatch(this.queues.high);

    // Then normal priority
    await this.loadBatch(this.queues.normal);

    // Finally low priority in background
    requestIdleCallback(() => {
      this.loadBatch(this.queues.low);
    });
  }

  private async loadBatch(fontIds: string[]) {
    // Load fonts in parallel, max 3 at a time
    const batchSize = 3;
    for (let i = 0; i < fontIds.length; i += batchSize) {
      const batch = fontIds.slice(i, i + batchSize);
      await Promise.all(batch.map(id => this.loadFont(id)));
    }
  }
}

// Usage
const fontLoader = new PriorityFontLoader();

// High priority: currently selected font
fontLoader.addToQueue('roboto', 'high');

// Normal priority: default fonts
fontLoader.addToQueue('inter', 'normal');
fontLoader.addToQueue('merriweather', 'normal');

// Low priority: all other fonts (background)
allFonts.forEach(font => fontLoader.addToQueue(font.id, 'low'));

fontLoader.processQueue();
```

### 9.5 Image Optimization

```bash
# Optimize template preview images
npm install -g sharp-cli

# Convert to WebP with quality 85
sharp -i input.png -o output.webp -f webp --quality 85

# Generate multiple sizes
sharp -i preview.png -o preview-400w.webp --resize 400 --quality 85
sharp -i preview.png -o preview-800w.webp --resize 800 --quality 85
sharp -i preview.png -o preview-1200w.webp --resize 1200 --quality 85
```

```typescript
// Next.js Image component with optimization
import Image from 'next/image';

function TemplatePreview({ template }) {
  return (
    <Image
      src={`/templates/${template.id}/preview.webp`}
      alt={template.name}
      width={400}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      quality={85}
      loading="lazy"
      placeholder="blur"
      blurDataURL={template.blurDataURL}
    />
  );
}
```

### 9.6 Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_templates_status_category
  ON templates(status, category_id, popularity DESC);

CREATE INDEX CONCURRENTLY idx_templates_search
  ON templates USING gin(to_tsvector('english', name || ' ' || description));

CREATE INDEX CONCURRENTLY idx_template_fonts_lookup
  ON template_fonts(template_id, font_id);

-- Materialized view for popular templates (refresh hourly)
CREATE MATERIALIZED VIEW popular_templates AS
SELECT
  t.*,
  COUNT(tu.id) as usage_count_30d
FROM templates t
LEFT JOIN template_usage tu ON t.id = tu.template_id
  AND tu.used_at > NOW() - INTERVAL '30 days'
WHERE t.status = 'active'
GROUP BY t.id
ORDER BY usage_count_30d DESC, t.popularity DESC
LIMIT 100;

-- Refresh every hour
CREATE INDEX ON popular_templates(usage_count_30d DESC);
```

### 9.7 Caching Strategy

```typescript
// Multi-level caching
class CacheManager {
  // Level 1: Memory cache (fastest)
  private memoryCache = new Map<string, any>();

  // Level 2: LocalStorage cache
  private storageCache = {
    get(key: string) {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const { value, expiry } = JSON.parse(item);
      if (Date.now() > expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return value;
    },

    set(key: string, value: any, ttl: number = 3600000) {
      const expiry = Date.now() + ttl;
      localStorage.setItem(`cache_${key}`, JSON.stringify({ value, expiry }));
    }
  };

  // Level 3: Service Worker cache (network)

  async get(key: string): Promise<any> {
    // Try memory first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Try localStorage
    const cached = this.storageCache.get(key);
    if (cached) {
      this.memoryCache.set(key, cached);
      return cached;
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.memoryCache.set(key, value);
    this.storageCache.set(key, value, ttl);
  }
}

// Usage
const cache = new CacheManager();

async function getTemplates() {
  const cached = await cache.get('templates_active');
  if (cached) return cached;

  const templates = await fetchTemplates();
  await cache.set('templates_active', templates, 1800000); // 30 min TTL

  return templates;
}
```

---

## 10. Security Considerations

### 10.1 Font Security

**Risks:**
- Malicious font files
- License violations
- XSS via font names
- Resource exhaustion

**Mitigations:**

```typescript
// Validate font files
import fontkit from 'fontkit';

async function validateFontFile(filePath: string): Promise<boolean> {
  try {
    const font = fontkit.openSync(filePath);

    // Check file size (reject if > 500KB)
    const stats = await fs.stat(filePath);
    if (stats.size > 500000) {
      throw new Error('Font file too large');
    }

    // Validate font metadata
    if (!font.postscriptName || !font.familyName) {
      throw new Error('Invalid font metadata');
    }

    // Check for suspicious characteristics
    if (font.numGlyphs > 10000) {
      throw new Error('Suspicious glyph count');
    }

    return true;
  } catch (error) {
    console.error('Font validation failed:', error);
    return false;
  }
}

// Sanitize font names
function sanitizeFontName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
}

// CSP headers for fonts
const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:"
  ].join('; ')
};
```

### 10.2 Template Security

**Risks:**
- XSS via template content
- Code injection
- Resource exhaustion
- Unauthorized access

**Mitigations:**

```typescript
// Sanitize template metadata
import DOMPurify from 'isomorphic-dompurify';

function sanitizeTemplateMetadata(metadata: any): any {
  return {
    ...metadata,
    name: DOMPurify.sanitize(metadata.name, { ALLOWED_TAGS: [] }),
    description: DOMPurify.sanitize(metadata.description, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong']
    }),
    author: DOMPurify.sanitize(metadata.author, { ALLOWED_TAGS: [] })
  };
}

// Validate template component
function validateTemplateComponent(componentPath: string): boolean {
  // Ensure path is within allowed directory
  const normalizedPath = path.normalize(componentPath);
  const allowedDir = path.normalize('/components/templates/');

  if (!normalizedPath.startsWith(allowedDir)) {
    throw new Error('Invalid template path');
  }

  // Check file exists
  if (!fs.existsSync(normalizedPath)) {
    throw new Error('Template component not found');
  }

  return true;
}

// Rate limiting for PDF generation
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);

  return true;
}
```

### 10.3 Database Security

```typescript
// Prepared statements (Prisma example)
async function getTemplate(templateId: string) {
  // Input validation
  if (!isValidUUID(templateId)) {
    throw new Error('Invalid template ID');
  }

  // Parameterized query (automatic with Prisma)
  return await prisma.template.findUnique({
    where: { id: templateId },
    // Only select needed fields
    select: {
      id: true,
      name: true,
      thumbnail: true,
      // ... exclude sensitive fields
    }
  });
}

// Row-level security (PostgreSQL)
CREATE POLICY template_access_policy ON templates
  FOR SELECT
  USING (status = 'active' OR created_by = current_user_id());
```

### 10.4 API Security

```typescript
// API route protection
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Rate limiting
  const ip = request.ip || 'unknown';
  if (!checkRateLimit(ip, 100, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    );
  }

  // Input validation
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (category && !isValidCategory(category)) {
    return NextResponse.json(
      { error: 'Invalid category' },
      { status: 400, headers }
    );
  }

  // ... handle request
}

function isValidCategory(category: string): boolean {
  const validCategories = ['modern', 'classic', 'minimalist', 'corporate', 'creative'];
  return validCategories.includes(category);
}
```

---

## 11. Best Practices & Guidelines

### 11.1 Template Development Guidelines

#### Do's:
- ✅ Extend `BaseTemplate` for all templates
- ✅ Use semantic HTML (`<header>`, `<main>`, `<footer>`, `<article>`)
- ✅ Keep templates under 500 lines of code
- ✅ Use Tailwind utility classes for styling
- ✅ Support all standard paper sizes (A4, Letter, Legal)
- ✅ Test with multiple fonts (serif, sans-serif, monospace)
- ✅ Include print-specific styles (`@media print`)
- ✅ Use rem units for scalability
- ✅ Provide clear preview images
- ✅ Document all customization options

#### Don'ts:
- ❌ Don't use absolute positioning (breaks layout)
- ❌ Don't hardcode colors (use variables)
- ❌ Don't use external dependencies
- ❌ Don't exceed 600 lines of code
- ❌ Don't use animations (breaks PDF)
- ❌ Don't rely on JavaScript for layout
- ❌ Don't use `px` units (use `rem` or `em`)
- ❌ Don't break page flow
- ❌ Don't use complex grid layouts (PDF issues)
- ❌ Don't forget accessibility

#### Template Checklist:

```markdown
## Template Quality Checklist

### Code Quality
- [ ] Extends BaseTemplate
- [ ] TypeScript types defined
- [ ] No ESLint errors
- [ ] No console.logs
- [ ] Comments for complex logic
- [ ] Under 500 lines

### Design Quality
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Print-friendly styles
- [ ] Accessible (WCAG AA)
- [ ] Visual hierarchy clear
- [ ] Whitespace balanced
- [ ] Typography readable

### Functionality
- [ ] Works with all required fonts
- [ ] Handles long content gracefully
- [ ] Supports all invoice features
- [ ] PDF generates correctly
- [ ] Prints correctly
- [ ] No layout breaks

### Assets
- [ ] Preview image (400x600)
- [ ] Thumbnail (200x300)
- [ ] Config.json complete
- [ ] README.md included
- [ ] License specified

### Testing
- [ ] Tested with 10+ fonts
- [ ] Tested with minimal data
- [ ] Tested with maximum data
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile devices
- [ ] PDF generation tested

### Documentation
- [ ] Usage instructions
- [ ] Customization options
- [ ] Supported features
- [ ] Known limitations
- [ ] Version history
```

### 11.2 Font Selection Guidelines

#### Criteria for Font Selection:

1. **License**: Must allow commercial use
2. **File Size**: < 100KB per variant (optimized)
3. **Readability**: Legible at 10pt and smaller
4. **PDF Compatible**: Renders correctly in PDFs
5. **Character Support**: Latin + Extended Latin minimum
6. **Professional**: Appropriate for business documents

#### Recommended Font Combinations:

```typescript
const fontPairings = [
  {
    name: "Classic Professional",
    heading: "Merriweather",
    body: "Open Sans",
    accent: "Roboto Mono"
  },
  {
    name: "Modern Clean",
    heading: "Poppins",
    body: "Inter",
    accent: "Fira Code"
  },
  {
    name: "Traditional Formal",
    heading: "Crimson Text",
    body: "Lora",
    accent: "Courier Prime"
  },
  {
    name: "Contemporary Bold",
    heading: "Montserrat",
    body: "Roboto",
    accent: "Space Mono"
  }
];
```

### 11.3 Performance Best Practices

#### Template Performance:

```typescript
// ✅ Good: Lazy load templates
const Template = lazy(() => import(`./templates/${templateId}`));

// ❌ Bad: Import all templates upfront
import Template1 from './templates/template-1';
import Template2 from './templates/template-2';
// ... 100 more imports

// ✅ Good: Memoize expensive calculations
const total = useMemo(() => calculateTotal(items), [items]);

// ❌ Bad: Recalculate on every render
const total = calculateTotal(items);

// ✅ Good: Debounce preview updates
const debouncedPreview = useDebouncedValue(invoiceData, 300);

// ❌ Bad: Update on every keystroke
onChange={(e) => updatePreview(e.target.value)}
```

#### Font Performance:

```typescript
// ✅ Good: Load fonts on demand
useEffect(() => {
  if (selectedFont) {
    loadFont(selectedFont);
  }
}, [selectedFont]);

// ❌ Bad: Load all fonts upfront
useEffect(() => {
  fonts.forEach(font => loadFont(font.id));
}, []);

// ✅ Good: Preload critical fonts
<link
  rel="preload"
  href="/fonts/roboto/roboto-regular.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

// ✅ Good: Use font-display: swap
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto/roboto-regular.woff2') format('woff2');
  font-display: swap;
}
```

### 11.4 Testing Strategy

```typescript
// Template unit tests
describe('ModernTemplate01', () => {
  it('renders with minimal data', () => {
    const minimalInvoice = createMinimalInvoice();
    render(<ModernTemplate01 invoice={minimalInvoice} />);
    expect(screen.getByText('Invoice')).toBeInTheDocument();
  });

  it('renders with maximum data', () => {
    const maximalInvoice = createMaximalInvoice();
    render(<ModernTemplate01 invoice={maximalInvoice} />);
    expect(screen.getByText(maximalInvoice.invoiceNumber)).toBeInTheDocument();
  });

  it('handles long content gracefully', () => {
    const longInvoice = {
      ...createMinimalInvoice(),
      items: Array(100).fill({ name: 'Item', quantity: 1, price: 10 })
    };
    render(<ModernTemplate01 invoice={longInvoice} />);
    // Should not overflow or break layout
  });

  it('works with different fonts', () => {
    const fonts = ['roboto', 'merriweather', 'inter'];
    fonts.forEach(font => {
      const { container } = render(
        <ModernTemplate01 invoice={invoice} font={{ id: font }} />
      );
      expect(container.querySelector(`.font-${font}`)).toBeInTheDocument();
    });
  });
});

// PDF generation tests (Playwright)
test('PDF generation works for all templates', async ({ page }) => {
  const templates = await getTemplates();

  for (const template of templates) {
    await page.goto(`/invoice?template=${template.id}`);
    await page.click('[data-testid="generate-pdf"]');

    // Wait for PDF generation
    const download = await page.waitForEvent('download');
    const path = await download.path();

    // Verify PDF is valid
    const pdfBuffer = await fs.readFile(path);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
  }
});
```

### 11.5 Accessibility Guidelines

```typescript
// Template accessibility
function AccessibleTemplate() {
  return (
    <article aria-label="Invoice Document">
      <header>
        <h1>Invoice</h1>
        <p aria-label="Invoice number">#{invoiceNumber}</p>
        <time dateTime={date} aria-label="Invoice date">
          {formatDate(date)}
        </time>
      </header>

      <main>
        <section aria-labelledby="items-heading">
          <h2 id="items-heading">Line Items</h2>
          <table>
            <caption className="sr-only">Invoice line items</caption>
            <thead>
              <tr>
                <th scope="col">Description</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* ... items */}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="totals-heading">
          <h2 id="totals-heading" className="sr-only">Invoice Totals</h2>
          <dl>
            <dt>Subtotal:</dt>
            <dd aria-label="Subtotal amount">{formatCurrency(subtotal)}</dd>
            <dt>Tax:</dt>
            <dd aria-label="Tax amount">{formatCurrency(tax)}</dd>
            <dt>Total:</dt>
            <dd aria-label="Total amount">{formatCurrency(total)}</dd>
          </dl>
        </section>
      </main>

      <footer>
        <p>Thank you for your business!</p>
      </footer>
    </article>
  );
}
```

### 11.6 Version Control Strategy

```bash
# Branching strategy
main                  # Production
├── develop           # Development
├── feature/template-modern-01
├── feature/template-classic-01
├── feature/font-system
└── hotfix/template-bug

# Commit message format
feat(templates): add Modern Professional template
fix(fonts): resolve Roboto loading issue
docs(templates): update template creation guide
perf(fonts): optimize font file sizes
test(templates): add PDF generation tests

# Template versioning
modern-01/
├── v1.0.0/
│   └── template.tsx
├── v1.1.0/
│   └── template.tsx
└── v2.0.0/
    └── template.tsx
```

---

## 12. Cost Analysis

### 12.1 Development Costs

| Resource | Time | Rate | Cost |
|----------|------|------|------|
| Senior Developer | 480 hours | $100/hr | $48,000 |
| UI/UX Designer | 120 hours | $80/hr | $9,600 |
| QA Engineer | 80 hours | $60/hr | $4,800 |
| **Total Labor** | | | **$62,400** |

### 12.2 Infrastructure Costs (Monthly)

#### Option A: Minimal (LocalStorage + Self-Hosted)
| Service | Cost |
|---------|------|
| Vercel Hosting | $0 (Hobby) or $20 (Pro) |
| Domain | $1/month |
| **Total** | **$1-21/month** |

#### Option B: PostgreSQL Database
| Service | Cost |
|---------|------|
| Vercel Hosting | $20 (Pro required for DB) |
| Vercel Postgres | $20 (Starter) |
| Domain | $1/month |
| **Total** | **$41/month** |

#### Option C: Full Production (CDN + Database + Analytics)
| Service | Cost |
|---------|------|
| Vercel Hosting | $20 |
| Vercel Postgres | $20 |
| Cloudflare R2 (CDN) | ~$5 (per TB) |
| Vercel Analytics | $10 |
| Domain | $1 |
| **Total** | **$56/month** |

### 12.3 Font Licensing Costs

#### Option A: Open Source Fonts Only
- Cost: $0
- Fonts available: ~50 high-quality fonts from Google Fonts, Adobe Fonts (open source)

#### Option B: Mixed (Open Source + Premium)
- Open source: 40 fonts ($0)
- Premium: 10 fonts (average $30/font)
- Cost: $300 one-time

#### Option C: All Premium
- 50 premium fonts × $30 average
- Cost: $1,500 one-time

**Recommendation:** Start with Option A (open source), add premium fonts based on user demand.

### 12.4 Total Cost Estimation

#### Year 1
| Item | Cost |
|------|------|
| Development | $62,400 |
| Infrastructure (12 months) | $600 |
| Fonts (open source) | $0 |
| Contingency (10%) | $6,300 |
| **Total Year 1** | **$69,300** |

#### Ongoing (Per Year)
| Item | Cost |
|------|------|
| Infrastructure | $600 |
| Maintenance (20% of dev) | $12,480 |
| **Total Ongoing** | **$13,080/year** |

---

## 13. Monitoring & Analytics

### 13.1 Key Metrics to Track

#### Template Metrics
- Usage count per template
- Usage trend (increasing/decreasing)
- Average customization time
- PDF generation success rate
- Error rate per template
- User ratings
- Mobile vs desktop usage

#### Font Metrics
- Usage count per font
- Most popular font pairings
- Font loading time
- Font load failure rate
- Browser compatibility issues

#### Performance Metrics
- Page load time (FCP, LCP, TTI)
- Template switch time
- Font load time
- PDF generation time
- Bundle size over time
- API response time

#### User Behavior
- Most viewed templates
- Template search queries
- Filter usage
- Favorite templates
- Drop-off points
- Session duration

### 13.2 Analytics Implementation

```typescript
// Analytics service
class AnalyticsService {
  trackTemplateView(templateId: string) {
    this.track('template_view', {
      template_id: templateId,
      timestamp: Date.now()
    });
  }

  trackTemplateSelection(templateId: string) {
    this.track('template_selected', {
      template_id: templateId,
      timestamp: Date.now()
    });
  }

  trackFontChange(templateId: string, fontId: string) {
    this.track('font_changed', {
      template_id: templateId,
      font_id: fontId,
      timestamp: Date.now()
    });
  }

  trackPDFGeneration(templateId: string, fontId: string, duration: number, success: boolean) {
    this.track('pdf_generated', {
      template_id: templateId,
      font_id: fontId,
      duration_ms: duration,
      success: success,
      timestamp: Date.now()
    });
  }

  trackPerformance(metric: string, value: number) {
    this.track('performance_metric', {
      metric: metric,
      value: value,
      timestamp: Date.now()
    });
  }

  private async track(event: string, data: any) {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, data);
    }

    // Also send to your API for custom analytics
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    });
  }
}

// Usage
const analytics = new AnalyticsService();

function TemplateCard({ template }) {
  return (
    <div
      onClick={() => {
        analytics.trackTemplateSelection(template.id);
        selectTemplate(template.id);
      }}
    >
      {/* ... */}
    </div>
  );
}
```

### 13.3 Error Monitoring

```typescript
// Error tracking
class ErrorTracker {
  captureError(error: Error, context: any = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      url: window.location.href
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorData);
    }

    // Send to error tracking service (e.g., Sentry)
    this.sendToErrorService(errorData);
  }

  private async sendToErrorService(errorData: any) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (e) {
      // Silently fail - don't let error tracking break the app
      console.error('Failed to send error:', e);
    }
  }
}

// Global error boundary
class TemplateErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.captureError(error, {
      component: 'TemplateErrorBoundary',
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### 13.4 Dashboard Views

```typescript
// Analytics dashboard queries
const dashboardQueries = {
  // Top 10 templates
  topTemplates: `
    SELECT
      t.id,
      t.name,
      COUNT(tu.id) as usage_count,
      AVG(tu.duration_ms) as avg_duration
    FROM templates t
    JOIN template_usage tu ON t.id = tu.template_id
    WHERE tu.used_at > NOW() - INTERVAL '30 days'
    GROUP BY t.id, t.name
    ORDER BY usage_count DESC
    LIMIT 10
  `,

  // Font popularity
  fontUsage: `
    SELECT
      f.id,
      f.name,
      COUNT(tu.id) as usage_count
    FROM font_registry f
    JOIN template_usage tu ON f.id = tu.font_id
    WHERE tu.used_at > NOW() - INTERVAL '30 days'
    GROUP BY f.id, f.name
    ORDER BY usage_count DESC
  `,

  // Error rate by template
  errorRate: `
    SELECT
      t.id,
      t.name,
      COUNT(CASE WHEN tu.success = false THEN 1 END) as errors,
      COUNT(*) as total,
      (COUNT(CASE WHEN tu.success = false THEN 1 END) * 100.0 / COUNT(*)) as error_rate
    FROM templates t
    JOIN template_usage tu ON t.id = tu.template_id
    WHERE tu.used_at > NOW() - INTERVAL '7 days'
    GROUP BY t.id, t.name
    HAVING error_rate > 5
    ORDER BY error_rate DESC
  `,

  // Performance trends
  performanceTrends: `
    SELECT
      DATE(used_at) as date,
      AVG(duration_ms) as avg_duration,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration
    FROM template_usage
    WHERE used_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(used_at)
    ORDER BY date
  `
};
```

---

## Conclusion

This comprehensive strategy provides a complete roadmap for scaling Invoify from 2 templates to 100+ templates with 50+ fonts. The key success factors are:

1. **Solid Architecture**: Template registry, font loader, and database schema provide a scalable foundation
2. **Performance First**: Aggressive caching, lazy loading, and optimization ensure fast user experience
3. **Phased Approach**: 24-week roadmap breaks the project into manageable phases
4. **Quality Control**: Strict guidelines, testing, and monitoring maintain high quality
5. **Cost Efficiency**: Start simple (LocalStorage + open source fonts), scale as needed

### Next Steps

1. **Review & Approval**: Get stakeholder sign-off on this strategy
2. **Phase 1 Kickoff**: Begin foundation architecture (Week 1)
3. **Pilot Program**: Create 10 test templates to validate approach
4. **Iterate**: Refine based on feedback before scaling to 100+
5. **Launch**: Roll out progressively to users with monitoring

### Success Metrics

By the end of implementation, you should achieve:
- ✅ 100+ high-quality templates
- ✅ 50+ optimized fonts
- ✅ < 3 second load time
- ✅ 95+ Lighthouse score
- ✅ Happy users with 5-star ratings

**Good luck with your implementation! This strategy provides everything you need to successfully scale Invoify's template system.**
