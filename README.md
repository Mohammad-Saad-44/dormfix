# DormFix

A comprehensive hostel maintenance management system for Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI).

## Overview

DormFix streamlines the process of reporting, tracking, and resolving maintenance issues in hostel facilities. The system provides role-based dashboards for students, supervisors, and technicians to efficiently manage maintenance complaints.

## Features

- **Student Portal**: Submit and track maintenance complaints
- **Supervisor Dashboard**: Review, assign, and monitor complaints for specific hostels
- **Technician Dashboard**: View and manage assigned maintenance tasks
- **Real-time Status Updates**: Track complaint status from submission to resolution
- **Role-based Access Control**: Secure authentication with GIKI email validation
- **Dark Mode Support**: User-friendly interface with light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Installation

### Prerequisites

- Node.js (v16 or higher)
- pnpm package manager

If you don't have pnpm installed, you can install it via npm:
```bash
npm install -g pnpm
```

### Steps

1. **Extract the downloaded folder**
   - Extract the DormFix folder to your desired location
   - Open terminal/command prompt in the extracted folder

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   - The application will automatically open in your default browser
   - Or manually navigate to the URL shown in your terminal (usually `http://localhost:5173`)

5. **Stop the server**
   - Press `Ctrl + C` in the terminal to stop the development server

## Application Structure

### User Roles

1. **Student**
   - Submit new maintenance complaints
   - Track complaint status
   - Rate completed work
   - View complaint history

2. **Supervisor**
   - View all complaints for assigned hostel
   - Assign complaints to technicians
   - Monitor complaint progress
   - Manage hostel-specific maintenance requests

3. **Technician**
   - View assigned tasks
   - Update task status (In Progress, Resolved)
   - Track workload and completed tasks

### Project Layout

```
src/
├── app/
│   ├── components/
│   │   ├── LandingPage.tsx          # Landing page
│   │   ├── SignInPage.tsx           # Authentication
│   │   ├── SignUpPage.tsx           # User registration
│   │   ├── StudentDashboard.tsx     # Student interface
│   │   ├── SupervisorDashboard.tsx  # Supervisor interface
│   │   ├── TechnicianDashboard.tsx  # Technician interface
│   │   ├── ComplaintDetailView.tsx  # Detailed complaint view
│   │   ├── FAQView.tsx              # FAQ section
│   │   └── ui/                      # Reusable UI components
│   ├── contexts/
│   │   ├── ComplaintsContext.tsx    # Global state management
│   │   └── ThemeContext.tsx         # Dark/light theme
│   ├── styles/
│   │   ├── theme.css                # Custom theme tokens
│   │   └── fonts.css                # Font imports
│   └── App.tsx                      # Main application
```

## Demo Credentials

### Students
- **Email**: ahmed.raza@giki.edu.pk  
  **Password**: student123  
  **Hostel**: Hostel 1

### Supervisors
- **Hostel 1**  
  **Email**: supervisor.irfan@giki.edu.pk  
  **Password**: super123

- **Hostel 2**  
  **Email**: supervisor.khalid@giki.edu.pk  
  **Password**: super123

- **Hostel 3**  
  **Email**: supervisor.rizwan@giki.edu.pk  
  **Password**: super123

### Technicians
- **Email**: kashif.ali@giki.edu.pk  
  **Password**: tech123

- **Email**: bilal.ahmad@giki.edu.pk  
  **Password**: tech123

- **Email**: usman.khan@giki.edu.pk  
  **Password**: tech123

## Key Features Explained

### Authentication
- GIKI email validation (@giki.edu.pk domain required)
- Role-based authentication (Student, Supervisor, Technician)
- One supervisor per hostel restriction
- Persistent sessions using localStorage

### Complaint Management
- Multi-category support (Plumbing, Electrical, Internet, AC/Fan, Furniture, Other)
- Priority levels (High, Medium, Low)
- Status tracking (Pending, Assigned, In Progress, Resolved, Rejected)
- Photo upload support for complaint documentation
- Unique complaint ID generation

### Hostel Management
- 5 hostels supported (Hostel 1-5)
- Supervisor-specific complaint filtering
- Hostel-based access control

### Data Persistence
- LocalStorage-based data management
- Registered user persistence
- Complaint history retention
- User session management

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: Single Page Application (SPA)
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Contact

**GIKI Campus**  
Topi, KPK, Pakistan  
Phone: +92-938-281026

## License

© 2026 DormFix. All rights reserved.
