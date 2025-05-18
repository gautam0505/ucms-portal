# Unified Complaint Management System (UCMS)

A comprehensive web application for citizens to lodge and track complaints with the Collectorate, and for officials to manage and resolve these complaints efficiently.

## Features

### For Citizens

- Account registration and login
- Lodge new complaints with detailed information and attachments
- Track complaint status and updates
- View complaint history and timeline
- Receive notifications on complaint updates

### For Officials

- Dashboard with complaint statistics and analytics
- Manage and assign complaints
- Update complaint status and add comments
- Generate reports on complaint data
- Escalate complaints to higher authorities

### For Administrators

- User management (create, edit, delete users)
- System-wide analytics and reporting
- Configure departments and categories

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Neon)
- **Authentication**: NextAuth.js
- **ORM**: Prisma
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (or Neon account)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`

# Database

POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=
POSTGRES_DATABASE=

# NextAuth

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Supabase (if using)

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Neon (if using)

NEON_NEON_DATABASE_URL=
\`\`\`

## Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/ucms-portal.git
   cd ucms-portal
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install

# or

yarn install
\`\`\`

3. Set up the database:
   \`\`\`bash
   npx prisma migrate dev
   npx prisma db seed
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev

# or

yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Using Neon PostgreSQL

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Create a new database
4. Copy the connection string and add it to your `.env.local` file

### Running Migrations

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

### Seeding the Database

The seed script will create default users and sample complaints:

\`\`\`bash
npx prisma db seed
\`\`\`

Default users created:

- Admin: admin@example.com / admin123
- Official: official@example.com / official123
- Citizen: user@example.com / user123

## Project Structure

\`\`\`
ucms-portal/
├── app/ # Next.js App Router
│ ├── api/ # API Routes
│ ├── complaints/ # Complaint pages
│ ├── dashboard/ # Dashboard pages
│ ├── login/ # Authentication pages
│ ├── register/ # Registration pages
│ ├── reports/ # Reports pages
│ ├── users/ # User management pages
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
├── components/ # Reusable components
├── lib/ # Utility functions
├── prisma/ # Database schema and migrations
├── public/ # Static assets
└── types/ # TypeScript type definitions
\`\`\`

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Add the environment variables
5. Deploy

## Authentication

The application uses NextAuth.js for authentication with the following providers:

- Credentials (email/password)
- OTP (one-time password via mobile)

## User Roles and Permissions

- **Citizen**: Can lodge and track complaints
- **Official**: Can manage and resolve complaints
- **Admin**: Has full access to the system, including user management

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/send-otp`: Send OTP to mobile number
- `POST /api/auth/verify-otp`: Verify OTP

### Complaint Endpoints

- `GET /api/complaints`: Get all complaints
- `POST /api/complaints`: Create a new complaint
- `GET /api/complaints/:id`: Get a specific complaint
- `PATCH /api/complaints/:id`: Update a complaint
- `POST /api/attachments`: Upload attachments for a complaint

### User Management Endpoints

- `GET /api/users`: Get all users
- `POST /api/users`: Create a new user
- `GET /api/users/:id`: Get a specific user
- `PATCH /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user

### Dashboard and Reports Endpoints

- `GET /api/dashboard`: Get dashboard statistics
- `GET /api/charts/complaints`: Get complaint chart data
- `GET /api/charts/categories`: Get category distribution data

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Neon](https://neon.tech/)
  \`\`\`

Now, let's create a comprehensive testing script to ensure all features work correctly:
