# Invoify - Complete Codebase Documentation

## Table of Contents
1. [What is this Project?](#what-is-this-project)
2. [Tech Stack - Simple Explanation](#tech-stack---simple-explanation)
3. [How the Application Works](#how-the-application-works)
4. [Backend System Explained](#backend-system-explained)
5. [Database & Data Storage](#database--data-storage)
6. [Frontend Architecture](#frontend-architecture)
7. [Tools & Libraries Used](#tools--libraries-used)
8. [Configuration & Setup](#configuration--setup)
9. [How to Deploy](#how-to-deploy)
10. [Key Features Breakdown](#key-features-breakdown)

---

## What is this Project?

**Project Name:** Invoify
**Type:** Web-based Invoice Generator Application
**Version:** 0.1.0

### In Simple Terms:
Imagine you run a small business and need to create professional invoices for your customers. Instead of using Microsoft Word or Excel, this web application lets you:
- Fill out a form with your business details
- Add items you're selling with prices
- Automatically calculate taxes, discounts, and totals
- Generate a beautiful PDF invoice
- Send it via email to your customer
- Save and reuse invoice templates
- Works in 16 different languages!

Think of it like a "smart invoice maker" that lives in your web browser.

---

## Tech Stack - Simple Explanation

### Core Technologies (The Foundation)

#### 1. **Next.js 15.3.3**
- **What it is:** A modern framework for building websites
- **Why it's special:** It can handle both the visual part (what you see) and the server part (what happens behind the scenes) in one project
- **Real-world analogy:** Like having a restaurant where the same kitchen handles both dine-in and takeout orders

#### 2. **TypeScript 5.2.2**
- **What it is:** JavaScript's smarter cousin
- **Why use it:** Catches mistakes before they become bugs
- **Real-world analogy:** Like spell-check for programming - it underlines errors as you type

#### 3. **React 18.2.0**
- **What it is:** A library for building interactive user interfaces
- **Why it's popular:** Makes it easy to create complex, dynamic web pages
- **Real-world analogy:** Like LEGO blocks for building websites - snap components together

#### 4. **Node.js 22**
- **What it is:** JavaScript that runs on a server (not in a browser)
- **Why needed:** Handles things like generating PDFs and sending emails
- **Real-world analogy:** The kitchen staff in a restaurant (users don't see them, but they do the heavy lifting)

---

## How the Application Works

### The Big Picture Flow

```
User Opens Website
    ↓
Fills Invoice Form (Your business info, customer info, items)
    ↓
Form Data Saved to Browser Memory (LocalStorage)
    ↓
User Clicks "Generate PDF"
    ↓
Data Sent to Server
    ↓
Server Converts Form into Beautiful PDF
    ↓
PDF Sent Back to User
    ↓
User Can Download, Print, or Email It
```

### Step-by-Step User Journey

1. **Landing Page**
   - User visits the website
   - Sees a clean form with sections for sender, receiver, and items
   - Can choose from 2 different invoice templates

2. **Filling the Form**
   - **Sender Section:** Your business name, address, email, tax ID
   - **Receiver Section:** Customer's details
   - **Items Section:** Products/services with prices (can add unlimited items)
   - **Charges Section:** Taxes, discounts, shipping costs
   - **Payment Info:** Bank details for customer to pay you
   - **Signature:** Can draw, type, or upload your signature

3. **Live Preview**
   - As you type, you can see a preview of how the invoice will look
   - Real-time calculation of totals

4. **Generate PDF**
   - Click button to create a professional PDF
   - Server takes ~2-5 seconds to generate it
   - PDF opens in a new tab or downloads automatically

5. **Additional Actions**
   - **Email:** Send PDF directly to customer's email
   - **Export:** Download invoice data as JSON, CSV, or XML
   - **Save:** Store invoice in browser to edit later
   - **Print:** Print directly from browser

---

## Backend System Explained

### What is a Backend?
Think of a website like an iceberg:
- **Frontend (tip of iceberg):** What users see and click
- **Backend (underwater part):** Processing, calculations, and heavy tasks

This project has a **minimal backend** because most work happens in the user's browser. The backend only does 3 specialized tasks:

---

### The 3 Backend Services

#### 1. PDF Generation Service (`/api/invoice/generate`)

**Location:** `app/api/invoice/generate/route.ts`

**What it does:**
Takes your invoice data and converts it into a professional PDF document.

**How it works (Simple Version):**
1. User clicks "Generate PDF"
2. Browser sends invoice data to this service
3. Service uses a tool called **Puppeteer** (like a robot browser)
4. Robot browser loads your invoice as a webpage
5. Robot browser prints that webpage to PDF
6. PDF sent back to your browser
7. You see the PDF appear

**Technical Details:**
- Uses **Puppeteer-Core** with **Chromium** browser
- Renders React components to HTML
- Applies CSS styling from Tailwind
- Maximum processing time: 60 seconds
- Returns PDF as binary data (blob)

**Why this approach?**
- Creating PDFs requires complex layout rendering
- Browsers are really good at displaying HTML/CSS
- So we let a browser do the hard work, then capture it as PDF

---

#### 2. Email Sending Service (`/api/invoice/send`)

**Location:** `app/api/invoice/send/route.ts`

**What it does:**
Emails the PDF invoice to your customer.

**How it works:**
1. User enters customer's email address
2. Clicks "Send via Email"
3. Service generates the PDF (calls service #1)
4. Creates a nice email template using React components
5. Attaches PDF to email
6. Sends email via Gmail

**Technical Details:**
- Uses **Nodemailer** library (email sending tool)
- Requires Gmail account credentials (stored in environment variables)
- Email template designed with **@react-email** (beautiful email templates)
- Returns success/failure status

**Security Note:**
The app doesn't store your email credentials - they're stored as environment variables (secret configuration files) that only the server can access.

---

#### 3. Export Service (`/api/invoice/export`)

**Location:** `app/api/invoice/export/route.ts`

**What it does:**
Converts your invoice data into different file formats for accounting software or spreadsheets.

**Supported Formats:**
- **JSON:** Raw data format (for developers or other software)
- **CSV:** Spreadsheet format (opens in Excel)
- **XML:** Structured data format (for accounting software)

**How it works:**
1. User selects export format from dropdown
2. Clicks export button
3. Service converts invoice data to chosen format
4. File downloads to your computer

**Technical Details:**
- **CSV:** Uses `@json2csv/node` library
- **XML:** Uses `xml2js` library
- **JSON:** Native JavaScript serialization
- Proper file headers and MIME types for downloads

---

### Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    USER'S BROWSER                    │
│  (Frontend - React Components, Forms, Buttons)      │
└───────────────────┬─────────────────────────────────┘
                    │
                    │ HTTP Requests
                    │
┌───────────────────▼─────────────────────────────────┐
│               NEXT.JS API ROUTES                     │
│              (Backend - Server Side)                 │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  /api/invoice/generate                     │    │
│  │  - Receives: Invoice Data                  │    │
│  │  - Returns: PDF File                       │    │
│  │  - Uses: Puppeteer + Chromium             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  /api/invoice/send                         │    │
│  │  - Receives: Email + Invoice Data          │    │
│  │  - Returns: Success/Failure                │    │
│  │  - Uses: Nodemailer + Gmail               │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  /api/invoice/export                       │    │
│  │  - Receives: Invoice Data + Format         │    │
│  │  - Returns: JSON/CSV/XML File             │    │
│  │  - Uses: json2csv, xml2js                 │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Database & Data Storage

### The Surprising Truth: There is NO Database!

Most web apps use databases like PostgreSQL, MySQL, or MongoDB. This application is different - it uses your **browser's storage** instead.

### Why No Database?

**Pros:**
- No database costs or maintenance
- Faster (no network requests to database)
- User data stays on their device (privacy!)
- Works offline (once loaded)

**Cons:**
- Data deleted if browser cache cleared
- Can't access invoices from different devices
- No multi-user collaboration

### How Data is Stored

#### LocalStorage (Browser Storage)

**What is LocalStorage?**
Every browser has a small storage area (like a mini hard drive) where websites can save data. It's like a notepad that the website can write to and read from.

**Storage Keys Used:**

1. **`savedInvoices`**
   - Stores all your completed invoices
   - Format: Array of invoice objects
   - Limit: Typically 5-10MB per website

2. **`invoify:invoiceDraft`**
   - Auto-saves your current invoice as you type
   - Restores form if you accidentally close the browser
   - Updates every time you change the form

---

### Data Models (Structure of Data)

#### Invoice Object Structure

```javascript
{
  // Sender (Your Business)
  sender: {
    name: "Acme Corp",
    address: "123 Business St",
    zipCode: "10001",
    city: "New York",
    country: "USA",
    email: "billing@acme.com",
    phone: "+1-555-0123",
    vatNumber: "VAT123456"
  },

  // Receiver (Customer)
  receiver: {
    name: "Customer Inc",
    address: "456 Client Ave",
    // ... similar fields
  },

  // Invoice Details
  details: {
    invoiceNumber: "INV-001",
    invoiceDate: "2025-11-03",
    dueDate: "2025-12-03",
    currency: { code: "USD", symbol: "$" },
    language: "en",

    // Items List
    items: [
      {
        name: "Web Design Service",
        description: "Homepage redesign",
        quantity: 1,
        unitPrice: 500,
        total: 500
      },
      // ... more items
    ],

    // Totals
    subTotal: 500,
    totalTax: 50,
    totalDiscount: 0,
    totalAmount: 550,

    // Additional Info
    tax: { enabled: true, rate: 10, amount: 50 },
    discount: { enabled: false, rate: 0, amount: 0 },
    shipping: { enabled: false, cost: 0 },

    // Payment Info
    paymentInformation: {
      bankName: "Chase Bank",
      accountNumber: "1234567890",
      // ...
    },

    // Signature
    signature: {
      data: "data:image/png;base64,...", // Image as text
      color: "#000000",
      font: "Arial"
    }
  }
}
```

---

### Data Validation (Making Sure Data is Correct)

**Tool Used:** Zod (Schema Validator)

**Location:** `lib/schemas.ts`

**What it does:**
Before saving or generating a PDF, the app checks if all data is valid:
- Email addresses are actual emails
- Numbers are numbers (not text)
- Required fields are filled
- Phone numbers have correct format

**Example Validation:**
```typescript
// Email must be valid format
email: z.string().email("Invalid email address")

// Tax rate must be a number
taxRate: z.number().min(0).max(100)

// Invoice number is required
invoiceNumber: z.string().min(1, "Invoice number required")
```

If validation fails, user sees an error message before the PDF is generated.

---

## Frontend Architecture

### What is the Frontend?
The frontend is everything you see and interact with:
- Forms, buttons, colors, layout
- Animations and transitions
- The visual design

---

### Component Structure (Building Blocks)

Think of the app like building with LEGO blocks. Each piece is a **component** (reusable building block).

#### Main Components

**1. InvoiceMain.tsx** (The Container)
- The main wrapper that holds everything
- Like the foundation of a house

**2. InvoiceForm.tsx** (The Form Container)
- Manages all form sections
- Handles form submission
- Uses **React Hook Form** (tool for managing forms)

**3. Form Sections** (Individual Parts)
Each section is a separate component:

- **BillFromSection.tsx** → Your business info form
- **BillToSection.tsx** → Customer info form
- **InvoiceDetails.tsx** → Invoice number, date, currency
- **Items.tsx** → List of products/services
  - Each item uses **SingleItem.tsx** (one row in the list)
  - Can drag and drop to reorder
- **Charges.tsx** → Tax, discount, shipping toggles
- **PaymentInformation.tsx** → Bank details
- **InvoiceSummary.tsx** → Total calculations display

**4. Action Components** (Buttons and Actions)

- **FinalPdf.tsx** → Shows generated PDF
- **LivePreview.tsx** → Real-time invoice preview
- **InvoiceActions.tsx** → Buttons (Save, Export, Email, Download)
- **SignatureModal.tsx** → Signature drawing/typing popup

**5. Navigation Components**

- **BaseNavbar.tsx** → Top menu bar
- **BaseFooter.tsx** → Bottom footer
- **WizardNavigation.tsx** → Step-by-step progress (if wizard mode)

---

### State Management (How Data Flows)

**Problem:** How do different parts of the app share information?

**Solution:** React Context API (Global State)

Think of Context like a **shared clipboard** that all components can read from and write to.

#### Contexts Used:

**1. InvoiceContext** (`contexts/InvoiceContext.tsx`)
- **Stores:** Generated PDF, saved invoices list
- **Methods:**
  - `generatePdf()` → Creates PDF
  - `downloadPdf()` → Downloads PDF
  - `printPdf()` → Opens print dialog
  - `sendPdfToMail()` → Emails PDF
  - `exportInvoiceAs()` → Exports to JSON/CSV/XML

**2. ChargesContext** (`contexts/ChargesContext.tsx`)
- **Stores:** Tax, discount, shipping toggles and amounts
- **Does:** Automatically calculates totals when items change
- **Magic:** Watches form values in real-time using `useWatch`

**3. SignatureContext** (`contexts/SignatureContext.tsx`)
- **Stores:** Signature image, color, font selection
- **Does:** Manages signature modal open/close state

**4. TranslationContext** (`contexts/TranslationContext.tsx`)
- **Stores:** Current language
- **Does:** Loads correct translations for UI text

**5. ThemeProvider** (`contexts/ThemeProvider.tsx`)
- **Stores:** Dark mode on/off
- **Does:** Applies dark/light theme CSS

---

### Form Management

**Library Used:** React Hook Form

**Why?**
Forms are hard to manage. This library makes it easy:
- Auto-saves form values
- Validates inputs
- Shows error messages
- Handles form submission

**How It Works:**
1. Define default form values
2. Register each input field
3. Library tracks changes automatically
4. Get all form data with one command: `form.getValues()`

**Draft Auto-Save:**
- Every time you type, form data is saved to LocalStorage
- If you close browser, data is restored when you come back
- No "Save Draft" button needed - it's automatic!

---

### UI Components (Design System)

**Library Used:** Shadcn UI (built on Radix UI)

**What it is:**
A collection of 20+ pre-designed, accessible components:

- **alert-dialog** → Confirmation popups ("Are you sure?")
- **button** → Styled buttons
- **calendar** → Date picker
- **card** → Container with shadow and border
- **dialog** → Modal popups
- **form** → Form field wrapper with label and error
- **input** → Text input fields
- **select** → Dropdown menus
- **switch** → Toggle switches (on/off)
- **table** → Data tables
- **tabs** → Tab navigation
- **textarea** → Multi-line text input
- **toast** → Notification messages

**Styling:** All styled with **Tailwind CSS** (utility-first CSS framework)

**Color Scheme:** Slate (grayish tones) with CSS variables for customization

---

### Routing & Navigation

**How URLs Work:**

```
https://invoify.vercel.app/en/         ← English homepage
https://invoify.vercel.app/es/         ← Spanish homepage
https://invoify.vercel.app/fr/template ← French template page
```

**Pattern:** `/[locale]/[page]`

**Supported Locales (Languages):**
- en (English)
- es (Spanish)
- fr (French)
- de (German)
- it (Italian)
- pt-BR (Brazilian Portuguese)
- ... and 10 more!

**How It Works:**
1. User visits site
2. **Middleware** (code that runs before page loads) detects URL
3. Extracts language code (e.g., "en")
4. Loads translations for that language
5. Renders page in correct language

**Special Files:**
- `middleware.ts` → Handles routing logic
- `i18n/routing.ts` → Defines supported languages
- `i18n/locales/*.json` → Translation files

---

## Tools & Libraries Used

### Categories of Tools

#### 1. UI & Styling Tools

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **Tailwind CSS** | Styling | Like CSS, but faster - write styles directly in HTML |
| **Shadcn UI** | Components | Pre-built, customizable UI components |
| **Radix UI** | Primitives | Unstyled, accessible components (foundation for Shadcn) |
| **Lucide React** | Icons | 1000+ beautiful icons (like Font Awesome) |
| **class-variance-authority** | Component styles | Create consistent component styles with variants |

#### 2. Form & Validation Tools

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **React Hook Form** | Form management | Makes forms easy - handles state, validation, submission |
| **Zod** | Validation | Checks if data is correct (like a bouncer at a club) |
| **@hookform/resolvers** | Integration | Connects Zod with React Hook Form |

#### 3. PDF & Browser Tools

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **Puppeteer Core** | Browser automation | Robot browser that can take screenshots and make PDFs |
| **@sparticuz/chromium** | Chromium binary | Mini Chrome browser for serverless environments |
| **Sharp** | Image processing | Resize, crop, optimize images |

#### 4. Email Tools

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **Nodemailer** | Email sending | Send emails from Node.js |
| **@react-email/components** | Email templates | Build beautiful emails with React |
| **@react-email/render** | Email rendering | Convert React components to HTML emails |

#### 5. Data Export Tools

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **@json2csv/node** | CSV export | Convert JSON data to Excel-compatible CSV |
| **xml2js** | XML export | Convert JSON to XML format |
| **xlsx** | Excel export | Create .xlsx Excel files (partially implemented) |

#### 6. Internationalization (i18n) Tools

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **next-intl** | Multi-language support | Makes app work in 16 languages |

#### 7. User Interface Enhancements

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **@dnd-kit** | Drag & drop | Drag invoice items to reorder them |
| **react-signature-canvas** | Signature drawing | Draw signatures with mouse/touch |
| **react-day-picker** | Date picker | Calendar widget to select dates |
| **use-debounce** | Performance | Delays actions until user stops typing |
| **react-use-wizard** | Multi-step forms | Create step-by-step wizards |

#### 8. Theming & Display

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **next-themes** | Dark mode | Switch between light and dark themes |
| **number-to-words** | Text conversion | Convert "100" to "One Hundred" |

#### 9. Analytics & Monitoring

| Tool | Purpose | Simple Explanation |
|------|---------|-------------------|
| **@vercel/analytics** | Usage tracking | See how many people use the app |

---

### Complete Dependency List

**Production Dependencies (62):**

```json
{
  "@dnd-kit/core": "^6.0.8",
  "@dnd-kit/sortable": "^7.0.2",
  "@dnd-kit/utilities": "^3.2.1",
  "@hookform/resolvers": "^3.3.2",
  "@json2csv/node": "^7.0.6",
  "@radix-ui/react-alert-dialog": "^1.0.5",
  "@radix-ui/react-aspect-ratio": "^1.0.3",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-navigation-menu": "^1.1.4",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "@radix-ui/react-tooltip": "^1.0.7",
  "@react-email/components": "0.0.15",
  "@react-email/render": "^0.0.12",
  "@react-email/tailwind": "^0.0.13",
  "@sparticuz/chromium": "^138.0.2",
  "@vercel/analytics": "^1.1.1",
  "autoprefixer": "^10.4.16",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "lucide-react": "^0.279.0",
  "next": "15.3.3",
  "next-intl": "^4.1.0",
  "next-themes": "^0.2.1",
  "nodemailer": "^6.9.7",
  "number-to-words": "^1.2.4",
  "puppeteer-core": "^24.9.0",
  "react": "^18.2.0",
  "react-day-picker": "^8.9.1",
  "react-dom": "^18.2.0",
  "react-email": "^2.0.0",
  "react-hook-form": "^7.46.1",
  "react-signature-canvas": "^1.0.6",
  "react-use-wizard": "^2.2.4",
  "sharp": "^0.33.0",
  "tailwind-merge": "^1.14.0",
  "tailwindcss": "^3.3.5",
  "tailwindcss-animate": "^1.0.7",
  "use-debounce": "^10.0.0",
  "xml2js": "^0.6.2",
  "xlsx": "^0.18.5",
  "zod": "^3.22.2"
}
```

**Development Dependencies (5):**

```json
{
  "@next/bundle-analyzer": "^14.0.4",
  "@types/node": "^20.8.9",
  "@types/react": "^18.2.33",
  "cross-env": "^7.0.3",
  "ignore-loader": "^0.1.2",
  "typescript": "^5.2.2"
}
```

---

## Configuration & Setup

### Environment Variables

**What are they?**
Secret configuration values that the app needs but shouldn't be in code (like passwords).

**File:** `.env.local` (not tracked in Git)

**Required Variables:**

```bash
# Email Sending (Required for email feature)
NODEMAILER_EMAIL=your-gmail@gmail.com
NODEMAILER_PW=your-app-specific-password

# SEO (Optional)
GOOGLE_SC_VERIFICATION=google-site-verification-code

# Environment
NODE_ENV=development  # or 'production'
```

**How to Get Gmail App Password:**
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use that password (not your actual Gmail password)

---

### Configuration Files

#### 1. `next.config.js` (Next.js Settings)

**Purpose:** Configure how Next.js builds and runs

**Key Settings:**
- **i18n:** Enable multi-language support
- **webpack:** Ignore source map files in production
- **externals:** Don't bundle Puppeteer (too large)
- **bundle analyzer:** Analyze what makes the build large

#### 2. `tsconfig.json` (TypeScript Settings)

**Purpose:** Tell TypeScript how to check code

**Key Settings:**
- **strict:** Enable all type checking
- **target:** Compile to ES5 (old browsers compatible)
- **paths:** Use `@/` as shortcut to root folder

#### 3. `tailwind.config.ts` (Tailwind CSS Settings)

**Purpose:** Configure Tailwind's utility classes

**Key Settings:**
- **content:** Which files to scan for classes
- **theme:** Custom colors, fonts, spacing
- **plugins:** Extended functionality

#### 4. `components.json` (Shadcn UI Settings)

**Purpose:** Configure how Shadcn components are installed

**Key Settings:**
- **style:** default (vs. new-york)
- **baseColor:** slate
- **cssVariables:** true (use CSS variables for theming)

#### 5. `middleware.ts` (Request Interceptor)

**Purpose:** Run code before pages load

**What it does:**
- Detects language from URL
- Redirects to correct locale
- Protects API routes from i18n routing

---

### Build & Development Scripts

**File:** `package.json`

```json
{
  "scripts": {
    "dev": "next dev",              // Start development server
    "build": "next build",          // Build for production
    "start": "next start",          // Start production server
    "lint": "next lint",            // Check code for errors
    "analyze": "cross-env ANALYZE=true next build"  // Analyze bundle size
  }
}
```

**How to Use:**

```bash
npm run dev       # Local development (hot reload)
npm run build     # Create production build
npm run start     # Run production build locally
npm run lint      # Check for code issues
npm run analyze   # See what's making your app large
```

---

## How to Deploy

### Option 1: Vercel (Easiest - Recommended)

**Steps:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables (NODEMAILER_EMAIL, NODEMAILER_PW)
6. Click "Deploy"
7. Done! You get a URL like `https://your-app.vercel.app`

**Pros:**
- Free tier available
- Automatic deployments on Git push
- Built-in CDN and SSL
- Perfect for Next.js (made by same company)

**Cons:**
- Limited to Vercel's infrastructure
- Free tier has usage limits

---

### Option 2: Docker (Self-Hosted)

**What is Docker?**
A tool that packages your app with all its dependencies into a "container" that can run anywhere.

**Files:** `Dockerfile` (included in project)

**Steps:**

1. **Build Docker Image:**
```bash
docker build -t invoify .
```

2. **Run Container:**
```bash
docker run -p 3000:3000 \
  -e NODEMAILER_EMAIL=your-email@gmail.com \
  -e NODEMAILER_PW=your-password \
  invoify
```

3. **Visit:** `http://localhost:3000`

**Pros:**
- Full control over hosting
- Can run on any server (AWS, DigitalOcean, your own server)
- Consistent across environments

**Cons:**
- Need to manage server
- More complex setup
- Need to handle SSL certificates manually

---

### Option 3: Other Platforms

**Compatible With:**
- **Netlify:** Similar to Vercel, may need adjustments
- **Railway.app:** Easy deployment with Docker support
- **Render.com:** Free tier with automatic deploys
- **AWS / Google Cloud:** Full control, more complex

---

## Key Features Breakdown

### 1. Multi-Language Support (i18n)

**How It Works:**
- User visits `/en/` for English or `/es/` for Spanish
- Middleware detects locale from URL
- App loads correct JSON translation file
- All text replaced with translations

**Supported Languages (16):**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese-Brazil (pt-BR)
- Arabic (ar)
- Polish (pl)
- Turkish (tr)
- Chinese (zh-CN)
- Japanese (ja)
- Norwegian Bokmål (nb-NO)
- Norwegian Nynorsk (nn-NO)
- Serbian (sr)
- Indonesian (id)
- Catalan (ca)

**Translation Files:** `i18n/locales/[language].json`

**Example Translation:**
```json
{
  "HomePage.title": "Create Beautiful Invoices",
  "InvoiceForm.billFrom": "Bill From",
  "InvoiceForm.billTo": "Bill To"
}
```

---

### 2. Dark Mode

**How It Works:**
- Uses **next-themes** library
- Detects system preference (dark/light)
- User can toggle manually
- Choice saved in localStorage
- CSS variables updated on theme change

**Implementation:**
- Button in navbar
- Changes CSS class on root element
- Tailwind classes respond to `dark:` prefix

**Example:**
```jsx
<div className="bg-white dark:bg-gray-900">
  Content
</div>
```

---

### 3. Live Preview

**What It Is:**
As you type in the form, a preview of the invoice updates in real-time.

**How It Works:**
- React Hook Form's `watch()` function monitors all fields
- Any change triggers re-render of preview component
- Preview component receives current form values as props
- Renders invoice template with current data

**Performance:**
- Uses **debouncing** (waits until user stops typing)
- Prevents too many re-renders
- Smooth user experience

---

### 4. Drag & Drop Items

**What It Is:**
Reorder invoice items by dragging them up or down.

**Library:** @dnd-kit

**How It Works:**
1. Each item has a drag handle icon
2. Click and hold to drag
3. Drop in new position
4. Items array updated
5. Total recalculated

---

### 5. Signature Options

**Three Ways to Add Signature:**

1. **Draw:**
   - Canvas element
   - Draw with mouse or touch
   - Saves as PNG image

2. **Type:**
   - Select fancy font (Dancing Script, Great Vibes, etc.)
   - Type your name
   - Converted to styled text image

3. **Upload:**
   - Select image file from computer
   - Converted to base64 (text representation of image)
   - Embedded in invoice

**Storage:**
- Signature stored as base64 string in invoice data
- No separate image files
- Travels with invoice data

---

### 6. Automatic Calculations

**What It Calculates:**

1. **Item Totals:**
   - Quantity × Unit Price = Total
   - Updates on any change

2. **Subtotal:**
   - Sum of all item totals

3. **Tax:**
   - Subtotal × Tax Rate = Tax Amount
   - Can be percentage or fixed amount

4. **Discount:**
   - Can be percentage or fixed amount
   - Applied after tax

5. **Shipping:**
   - Fixed cost added to total

6. **Grand Total:**
   - Subtotal + Tax - Discount + Shipping

**Formula:**
```
subtotal = sum(items.map(item => item.total))
taxAmount = subtotal × (taxRate / 100)
discountAmount = subtotal × (discountRate / 100)
grandTotal = subtotal + taxAmount - discountAmount + shipping
```

**Where:** `contexts/ChargesContext.tsx`

---

### 7. Currency Support

**Features:**
- 150+ currencies from around the world
- Proper symbols ($, €, £, ¥, etc.)
- Decimal place handling
- Right-to-left display for some currencies

**Data Source:**
- Static JSON file: `public/assets/data/currencies.json`
- Contains:
  - Currency code (USD, EUR, GBP)
  - Currency symbol
  - Decimal places
  - Currency name

**Number Formatting:**
- Adds commas to thousands (1,000)
- Respects decimal places
- Currency symbol position (before/after amount)

---

### 8. Template System

**Current Templates:** 2 styles

1. **Classic:**
   - Traditional business invoice layout
   - Clean, professional
   - Best for formal invoices

2. **Modern:**
   - Contemporary design
   - More visual appeal
   - Best for creative businesses

**How It Works:**
- User selects template from dropdown
- Template ID stored in invoice data
- PDF service uses correct template when generating

**Extensibility:**
- Can add more templates by creating new React components
- Template switcher updates preview in real-time

---

### 9. Import/Export

**Export Formats:**

**JSON:**
- Complete invoice data
- Can be re-imported
- Use case: Backup, transfer between computers

**CSV:**
- Spreadsheet format (Excel, Google Sheets)
- Flattened data (one row per invoice item)
- Use case: Accounting, data analysis

**XML:**
- Structured format
- Use case: Integration with accounting software

**PDF:**
- Human-readable invoice
- Use case: Send to customer, print

**Import:**
- JSON only
- Click "Import" button
- Select JSON file
- Form populated with data

---

### 10. Save & Reuse Invoices

**How It Works:**

**Saving:**
1. Click "Save Invoice" button
2. Invoice data stored in browser's localStorage
3. Added to "Saved Invoices" list

**Loading:**
1. Click "Saved Invoices" button
2. List of saved invoices appears
3. Click on invoice
4. Form populated with saved data
5. Edit and generate new PDF

**Use Cases:**
- Recurring clients (same customer details)
- Similar projects (copy items, change quantities)
- Templates for different service types

**Limitations:**
- Stored locally (can't access from different device)
- Limited by browser storage (typically 5-10MB)
- Cleared if browser cache cleared

---

### 11. Email Integration

**What It Does:**
Send invoice PDF directly to customer's email from the app.

**How It Works:**

**User Flow:**
1. Generate PDF
2. Click "Send via Email"
3. Enter customer's email
4. Optionally add custom message
5. Click send
6. PDF emailed

**Behind the Scenes:**
1. Frontend calls `/api/invoice/send`
2. Backend generates PDF (if not already generated)
3. Backend creates HTML email using React Email template
4. Backend sends email via Gmail SMTP
5. Success/failure message shown to user

**Email Template:**
- Professional design
- Includes invoice details
- PDF attached
- Customizable message
- Company branding

**Requirements:**
- Gmail account with App Password
- Environment variables configured

---

### 12. Number to Words

**What It Is:**
Converts total amount to words (e.g., "$500" → "Five Hundred Dollars")

**Use Case:**
Required in many countries for legal/accounting purposes.

**Library:** number-to-words

**Example:**
```
Amount: $1,234.56
Words: One Thousand Two Hundred Thirty-Four Dollars and Fifty-Six Cents
```

**Display:**
Shown at bottom of invoice, often in italics.

---

## Technical Architecture Summary

### Frontend Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER                            │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         React Application                   │    │
│  │                                             │    │
│  │  ┌──────────────────────────────────────┐  │    │
│  │  │      Context Providers (State)       │  │    │
│  │  │  - InvoiceContext                    │  │    │
│  │  │  - ChargesContext                    │  │    │
│  │  │  - SignatureContext                  │  │    │
│  │  │  - ThemeProvider                     │  │    │
│  │  │  - TranslationContext               │  │    │
│  │  └──────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  ┌──────────────────────────────────────┐  │    │
│  │  │      React Hook Form                 │  │    │
│  │  │  - Invoice form fields               │  │    │
│  │  │  - Validation (Zod)                  │  │    │
│  │  │  - Auto-save to LocalStorage        │  │    │
│  │  └──────────────────────────────────────┘  │    │
│  │                                             │    │
│  │  ┌──────────────────────────────────────┐  │    │
│  │  │      UI Components                   │  │    │
│  │  │  - InvoiceForm                       │  │    │
│  │  │  - LivePreview                       │  │    │
│  │  │  - InvoiceActions                    │  │    │
│  │  │  - Shadcn UI components              │  │    │
│  │  └──────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │      LocalStorage                          │    │
│  │  - savedInvoices                           │    │
│  │  - invoify:invoiceDraft                    │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────┘
                       │
                       │ API Calls (fetch)
                       │
┌──────────────────────▼───────────────────────────────┐
│               Next.js Backend                         │
│                                                       │
│  /api/invoice/generate  → PDF Generation             │
│  /api/invoice/send      → Email Sending              │
│  /api/invoice/export    → Data Export                │
└───────────────────────────────────────────────────────┘
```

---

### Data Flow Diagram

```
User Types in Form
       ↓
React Hook Form captures change
       ↓
Form data saved to LocalStorage (draft)
       ↓
Context watchers update state
       ↓
Live Preview re-renders
       ↓
Calculations recalculated (ChargesContext)
       ↓
User clicks "Generate PDF"
       ↓
InvoiceContext.generatePdf() called
       ↓
API call to /api/invoice/generate
       ↓
Server receives invoice data
       ↓
Puppeteer launches Chromium browser
       ↓
React component rendered to HTML
       ↓
Tailwind CSS applied
       ↓
Browser prints HTML to PDF
       ↓
PDF sent back as blob
       ↓
User sees PDF in new tab
       ↓
User can download, print, or email
```

---

## Security Considerations

### What's Secure

1. **No Database = No Database Breaches**
   - User data never leaves their browser
   - No centralized storage to hack

2. **Environment Variables**
   - Sensitive data (email credentials) hidden from code
   - Not exposed to frontend

3. **Input Validation**
   - Zod schemas validate all inputs
   - Prevents injection attacks

4. **Serverless Functions**
   - Each request runs in isolated environment
   - No persistent server to compromise

### Potential Concerns

1. **Email Credentials**
   - Currently uses Gmail
   - Better: Use SendGrid, Mailgun, or AWS SES

2. **No Rate Limiting**
   - Anyone can spam PDF generation
   - Solution: Add rate limiting middleware

3. **No Authentication**
   - Anyone can use the service
   - Fine for public tool, but consider auth for private use

4. **LocalStorage**
   - Data accessible to JavaScript
   - Could be read by malicious browser extensions
   - Solution: Consider encryption for sensitive invoices

5. **Email Sending**
   - No SPF/DKIM validation
   - Emails might go to spam
   - Solution: Configure proper email authentication

---

## Performance Optimizations

### Already Implemented

1. **Next.js App Router**
   - Server-side rendering for SEO
   - Automatic code splitting
   - Route prefetching

2. **Debounced Inputs**
   - Reduces unnecessary re-renders
   - Waits until user stops typing

3. **LocalStorage**
   - No network latency
   - Instant data access

4. **Tailwind CSS**
   - Purges unused styles
   - Small CSS bundle size

5. **Bundle Analyzer**
   - Identifies large dependencies
   - Helps optimize imports

### Possible Improvements

1. **Image Optimization**
   - Next.js Image component for logos
   - Automatic resizing and WebP conversion

2. **Lazy Loading**
   - Load preview only when needed
   - Reduce initial page load

3. **Service Worker**
   - Cache assets for offline use
   - Faster repeat visits

4. **Memoization**
   - Cache calculation results
   - Reduce CPU usage

---

## Project Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | 128+ |
| **React Components** | 49 TSX files |
| **API Endpoints** | 3 |
| **Supported Languages** | 16 |
| **UI Components** | 20+ (Shadcn) |
| **Production Dependencies** | 62 |
| **Dev Dependencies** | 5 |
| **Lines of Code** | ~8,000-10,000 (estimated) |
| **Contexts** | 6 |
| **TypeScript Config** | 100% TypeScript |

---

## Common User Workflows

### Workflow 1: Create First Invoice

1. Open website
2. Fill "Bill From" section with your business info
3. Fill "Bill To" section with customer info
4. Add invoice number and date
5. Select currency
6. Add items (products/services)
7. Toggle tax if needed, enter rate
8. Add signature (draw, type, or upload)
9. Click "Generate PDF"
10. Download or email to customer

**Time:** ~5-10 minutes

---

### Workflow 2: Recurring Invoice

1. Open website
2. Click "Saved Invoices"
3. Select previous invoice for same customer
4. Form auto-fills with saved data
5. Change invoice number and date
6. Update items if needed
7. Generate PDF

**Time:** ~2-3 minutes

---

### Workflow 3: Export for Accounting

1. Create or load invoice
2. Click "Export" button
3. Select format (CSV recommended)
4. Download file
5. Import to Excel or accounting software

**Time:** ~30 seconds

---

## Frequently Asked Questions

### Q: Is my data safe?
**A:** Yes! Your invoice data never leaves your browser. It's stored in your browser's LocalStorage, not on any server. Even when generating PDFs or sending emails, only temporary data is sent to the server and immediately discarded.

### Q: Can I use this offline?
**A:** Partially. You can fill out invoices offline, but generating PDFs and sending emails requires an internet connection (needs to reach server).

### Q: Why Next.js instead of plain React?
**A:** Next.js provides:
- Built-in API routes (no separate backend needed)
- Server-side rendering (better SEO)
- File-based routing (easier navigation)
- Image optimization
- Better performance

### Q: Can I add more languages?
**A:** Yes! Steps:
1. Create new translation JSON in `i18n/locales/`
2. Add language code to `i18n/routing.ts`
3. Rebuild app

### Q: Why Puppeteer for PDFs?
**A:** Puppeteer renders HTML/CSS to PDF perfectly. Other PDF libraries (like PDFKit) require manual layout coding, which is harder and less flexible.

### Q: Can I customize invoice templates?
**A:** Yes! Create new React component in `components/` folder following existing template structure. Add to template selector.

### Q: Why no user accounts?
**A:** Keeps the app simple and private. No registration, no passwords, no user tracking. Everything stays on your device.

### Q: Can I self-host this?
**A:** Absolutely! Use Docker or deploy to any Node.js hosting. See "How to Deploy" section.

### Q: Is this production-ready?
**A:** Yes, with caveats:
- ✅ Works perfectly for personal/small business use
- ✅ Generates professional PDFs
- ✅ Actively maintained
- ⚠️ No user authentication
- ⚠️ No rate limiting
- ⚠️ Email requires Gmail (not ideal for scale)

For high-volume use, consider adding authentication and switching to a transactional email service.

---

## Conclusion

**Invoify** is a modern, client-first invoice generator built with cutting-edge web technologies. It leverages:

- **Next.js 15** for full-stack capabilities
- **React 18** for interactive UI
- **TypeScript** for type safety
- **Tailwind CSS** for rapid styling
- **Puppeteer** for PDF generation
- **Nodemailer** for email integration
- **next-intl** for internationalization

The architecture prioritizes:
- **User Privacy** (data stored locally)
- **Simplicity** (no authentication complexity)
- **Performance** (fast, responsive UI)
- **Accessibility** (16 languages, dark mode)
- **Developer Experience** (TypeScript, organized structure)

Whether you're a freelancer needing quick invoices or a small business managing clients, Invoify provides a complete solution without the bloat of traditional invoicing software.

---

**Last Updated:** 2025-11-03
**Version:** 0.1.0
**License:** Check repository for license details

---

## Additional Resources

### Documentation
- Next.js Docs: https://nextjs.org/docs
- React Hook Form: https://react-hook-form.com
- Tailwind CSS: https://tailwindcss.com
- Shadcn UI: https://ui.shadcn.com

### Repository Structure
- `/app` - Next.js pages and API routes
- `/components` - React components
- `/contexts` - State management
- `/lib` - Utilities and configurations
- `/i18n` - Translation files
- `/services` - Business logic
- `/public` - Static assets

### Getting Help
- Check README.md for setup instructions
- Review issues on GitHub
- Consult Next.js and React documentation

---

*This documentation was created to explain the Invoify codebase in simple, layman terms. For technical implementation details, refer to the source code and inline comments.*
