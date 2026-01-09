# Next.js SPA

A modern Single Page Application (SPA) built with Next.js, React, and Tailwind CSS.

## Features

- ⚡ **Next.js 14** with App Router
- ⚛️ **React 18** with modern hooks
- 🎨 **Tailwind CSS** for styling
- 📦 **Static Export** for SPA deployment
- 🚀 **Fast Performance** with optimized builds

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

Build the static SPA:

```bash
npm run build
```

This will create an `out` directory with all static files ready for deployment.

### Deploy

The `out` directory can be deployed to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any static file server

## Project Structure

```
├── app/
│   ├── layout.js       # Root layout with navigation
│   ├── page.js         # Home page
│   ├── globals.css     # Global styles
│   ├── about/
│   │   └── page.js     # About page
│   └── contact/
│       └── page.js     # Contact page
├── next.config.js      # Next.js configuration (static export)
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## Pages

- **Home** (`/`) - Welcome page with feature highlights
- **About** (`/about`) - Information about the application
- **Contact** (`/contact`) - Contact form

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## License

MIT
