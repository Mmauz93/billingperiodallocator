# Invoice Period Allocator

This is a [Next.js](https://nextjs.org) application that helps users allocate invoice amounts across different calendar periods.

## Purpose

The Invoice Period Allocator allows you to:
- Split invoice amounts across multiple calendar years
- Calculate proportional allocation based on days in each period
- Export results to Excel or PDF formats
- Configure display settings like decimal places and thousand separators

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the application by modifying files in the `src/` directory. The main page is in `src/app/page.tsx`. The page auto-updates as you edit the files.

## Project Structure

The project follows standard Next.js structure:
- `src/app` - Next.js app router pages
- `src/components` - React components
- `src/lib` - Utility functions and business logic
- `src/context` - React context providers
- `src/messages` - i18n translation files
- `public` - Static assets and legal documents

## Internationalization

The application supports multiple languages:
- English (default)
- German

Legal documents (Terms of Use, Privacy Policy) are available in both languages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
