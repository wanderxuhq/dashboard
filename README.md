# Dashboard Project

This is a dashboard project built with [Next.js](https://nextjs.org), integrating Gmail and GitHub functionalities, aimed at providing a centralized interface for managing and viewing emails and GitHub notifications.

## Project Overview

This project is created using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and supports viewing emails, marking them as read, and managing GitHub notifications.

## Key Features

- **Email Preview**: Users can view detailed information about Gmail emails.
- **Mark Emails as Read**: Users can mark emails as read.
- **GitHub Notifications**: Integrated with GitHub, allowing users to view relevant notifications.
- **Data Fetching**: Fetches email and GitHub data from APIs and displays it on the page.

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

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Tech Stack

- **Next.js**: For building server-side rendered and statically generated applications.
- **TypeScript**: Adds type safety to JavaScript.
- **CSS Modules**: For modular styling.
- **DOMPurify**: For safely rendering HTML content.

## Directory Structure

```
app/
├── components/          # Components directory
│   ├── EmailPreview.tsx # Email preview component
│   └── EmailPreview.module.css # Email preview component styles
├── layout.tsx          # Application layout
├── page.tsx            # Main page
├── api/                # API directory
│   └── feeds/          # Data sources
├── styles/             # Styles directory
└── ...
next.config.js          # Next.js configuration file
tsconfig.json           # TypeScript configuration file
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
