# Description

Sample Api for creating PDF invoices and quotes. Made with Express and TypeScript.

# Requirements

- Node.js
- npm

There aren't many libraries that can create PDFs for free and don't need some kind of browser component or kit to work.
This project uses "pdf-lib" which is written purely in JavaScript, so it doesn't have any dependencies. This makes it easy to deploy on lightweight containers.

# Usage

1. Clone the repository

```bash
git clone
```

2. Install the dependencies

```bash
npm install
```

3. Run the server

```bash
npm run dev
```

# Endpoints

- POST /invoice
