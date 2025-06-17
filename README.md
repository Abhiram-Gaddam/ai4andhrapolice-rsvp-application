# RSVP Management System

A comprehensive QR code-based RSVP management system built with Next.js and Supabase.

## Features

### 🎭 Three User Roles

1. **QR Generator** (`/generator`)
   - Add invitee names manually
   - Upload Excel/CSV files
   - Generate and download QR codes
   - **Enhanced Management Options:**
     - 👁️ View QR Code in modal
     - 📥 Download individual QR codes
     - ✏️ Edit invitee names
     - 🗑️ Delete invitees with mandatory reason logging

2. **Invitee** (`/rsvp?id=token`)
   - Scan QR code for personalized RSVP page
   - Simple Yes/No response buttons
   - Automatic tracking of QR scans

3. **Admin** (`/admin`)
   - Complete dashboard with statistics
   - View all invitees and their status
   - Search and filter functionality
   - Export data to CSV
   - **Deletion Log** (`/admin/deletion-log`)
     - Track all deleted invitees with reasons
     - Export deletion history

## New Management Features

### QR Generator Enhanced Actions
Each invitee row now has 4 action buttons:
- **👁️ View QR**: Opens modal with QR code preview and copy link
- **📥 Download QR**: Instantly downloads QR code as PNG
- **✏️ Edit Name**: Modal to edit invitee name with preview
- **🗑️ Delete**: Requires mandatory reason, logs to deletion_log table

### Deletion Tracking
- All deletions are logged with timestamp and reason
- Deletion log accessible from admin dashboard
- Export deletion history to CSV
- Statistics showing deletion counts by period

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Database Setup
Run the SQL scripts in your Supabase SQL editor:
1. `scripts/001-create-tables.sql` (includes new deletion_log table)
2. `scripts/002-seed-sample-data.sql`

### 4. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

## Usage

1. **Generate QR Codes**: Visit `/generator` to add invitees and manage them
2. **RSVP Process**: Invitees scan QR codes to access their personalized RSVP page
3. **Monitor Responses**: Use `/admin` to track all responses and export data
4. **Track Deletions**: View deletion history at `/admin/deletion-log`

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **QR Generation**: qrcode library
- **TypeScript**: Full type safety

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── generator/         # QR Generator page
│   ├── rsvp/             # RSVP confirmation page
│   ├── admin/            # Admin dashboard
│   │   └── deletion-log/ # Deletion tracking page
│   └── actions/          # Server actions
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── delete-confirm-modal.tsx  # Delete with reason modal
│   ├── edit-name-modal.tsx       # Edit name modal
│   └── deletion-log-dashboard.tsx # Deletion history view
├── lib/                 # Utility functions
├── scripts/             # Database SQL scripts
└── ...                  # Config files
\`\`\`

## License

MIT License
