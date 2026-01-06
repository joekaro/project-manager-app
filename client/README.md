# Project Management App

A full-stack project management application with a beautiful Kanban board interface. Built with the MERN stack (MongoDB, Express, React, Node.js) and designed with mobile-first responsive principles.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure JWT-based registration and login
- **Project Management** - Create, edit, delete, and organize projects
- **Kanban Board** - Drag-and-drop task management across To Do, In Progress, and Done columns
- **Task Management** - Full CRUD operations with priority levels and due dates

### Advanced Features
- **Real-time Statistics Dashboard** - Track completion rates, overdue tasks, and project progress
- **Smart Filters** - Search tasks by title/description and filter by priority
- **Mobile-First Design** - Fully responsive across all devices (phone, tablet, desktop)
- **Visual Priority System** - Color-coded priority levels (High, Medium, Low)
- **Overdue Task Alerts** - Automatic highlighting of tasks past their due date

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier)

### Backend Setup

1. Navigate to server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

## 📱 Mobile-First Responsive Design

The entire application is built mobile-first with Tailwind CSS responsive breakpoints:
- **Mobile** (default): Optimized for phones
- **sm:** (640px+): Enhanced for larger phones
- **md:** (768px+): Tablet layout
- **lg:** (1024px+): Desktop with side-by-side columns

## 🎯 Key Implementation Details

### Authentication Flow
- Passwords hashed with bcrypt before storage
- JWT tokens for stateless authentication
- Protected routes on both frontend and backend
- Auto-logout on token expiration

### Drag & Drop
- Native HTML5 drag and drop API
- Real-time status updates on drop
- Visual feedback during drag operations

### Statistics Calculation
- Real-time calculation of project metrics
- Completion rate percentage
- Overdue task detection based on current date

## 🚀 Future Enhancemen# Project Management App

A full-stack project management application with a beautiful Kanban board interface. Built with the MERN stack (MongoDB, Express, React, Node.js) and designed with mobile-first responsive principles.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure JWT-based registration and login
- **Project Management** - Create, edit, delete, and organize projects
- **Kanban Board** - Drag-and-drop task management across To Do, In Progress, and Done columns
- **Task Management** - Full CRUD operations with priority levels and due dates

### Advanced Features
- **Real-time Statistics Dashboard** - Track completion rates, overdue tasks, and project progress
- **Smart Filters** - Search tasks by title/description and filter by priority
- **Mobile-First Design** - Fully responsive across all devices (phone, tablet, desktop)
- **Visual Priority System** - Color-coded priority levels (High, Medium, Low)
- **Overdue Task Alerts** - Automatic highlighting of tasks past their due date

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free tier)

### Backend Setup

1. Navigate to server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client folder:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

## 📱 Mobile-First Responsive Design

The entire application is built mobile-first with Tailwind CSS responsive breakpoints:
- **Mobile** (default): Optimized for phones
- **sm:** (640px+): Enhanced for larger phones
- **md:** (768px+): Tablet layout
- **lg:** (1024px+): Desktop with side-by-side columns

## 🎯 Key Implementation Details

### Authentication Flow
- Passwords hashed with bcrypt before storage
- JWT tokens for stateless authentication
- Protected routes on both frontend and backend
- Auto-logout on token expiration

### Drag & Drop
- Native HTML5 drag and drop API
- Real-time status updates on drop
- Visual feedback during drag operations

### Statistics Calculation
- Real-time calculation of project metrics
- Completion rate percentage
- Overdue task detection based on current date

## 🚀 Future Enhancements

- Real-time collaboration with WebSockets
- File attachments for tasks
- Comments and activity log
- Email notifications for due dates
- Team member invitation system
- Dark mode toggle

## 👨‍💻 Developer

Built by [Your Name] as a portfolio project to demonstrate full-stack development skills.

## 📄 License

MIT License - Feel free to use this project for learning and portfolio purposes.ts

- Real-time collaboration with WebSockets
- File attachments for tasks
- Comments and activity log
- Email notifications for due dates
- Team member invitation system
- Dark mode toggle

## 👨‍💻 Developer

Built by [Your Name] as a portfolio project to demonstrate full-stack development skills.

## 📄 License

MIT License - Feel free to use this project for learning and portfolio purposes.