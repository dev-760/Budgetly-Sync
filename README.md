# Budgetly Sync

Budgetly is a modern, offline-first personal finance application built for students. It offers zero-latency tracking, comprehensive budget insights, and automatic background synchronization across all your devices.

> **Note:** The application has been upgraded to the **V2 UI design**, featuring refined layouts, fluid animations, and a polished user interface.

For a detailed breakdown of the technical stack and architecture, please see the [Technical Handover Document](./handover.md).

## 🚀 Hosting on Vercel (Prisma Postgres Integration)

This project has been heavily optimized for deployment on Vercel using the new **Prisma Postgres** integration. Follow these steps to host your project in less than 5 minutes:

### 1. Push to GitHub
If you haven't already, initialize a Git repository and push your code to GitHub, GitLab, or Bitbucket.
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Import to Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Import your Budgetly repository from GitHub.

### 3. Provision Prisma Postgres
Before clicking "Deploy", you need to attach a database so the background synchronization engine works:
1. In the Vercel project setup screen, navigate to the **Storage** or **Integrations** tab.
2. Select **Prisma Postgres** (or Vercel Postgres) and click **Add**.
3. Follow the prompts to create the database. Vercel will automatically inject the required `DATABASE_URL` into your project's Environment Variables.

### 4. Deploy
1. Ensure your framework preset is set to **Next.js**.
2. Vercel will automatically run the `postinstall` script (`prisma generate`) configured in the `package.json`.
3. Click **Deploy**. 

### 5. Initialize the Database Schema (Post-Deployment)
Once the deployment finishes, your database is connected but empty. You need to push the Prisma schema to create the tables.
1. Open your terminal locally.
2. Pull the Vercel environment variables to your local machine:
   ```bash
   npx vercel env pull .env.local
   ```
3. Push the schema to your production database:
   ```bash
   npx prisma db push
   ```

You're done! Your app is now live, fully secure, and continuously syncing your local data to the cloud.

## Features
*   **Local-First Experience:** Uses `zustand` to store data locally so it works instantly and entirely offline.
*   **Background Synchronization:** A background worker quietly syncs your data to the cloud when an internet connection is available.
*   **Enterprise-Grade Security:** Fortified with Zod payload validation, API rate limiting, and strict security headers.
*   **Vercel Observability:** Integrated with `@vercel/analytics` and `@vercel/speed-insights`.