# 🎯 Project Management App – Frontend

A modern, responsive web interface for managing projects, tickets, and teams—built using **Next.js 15**, **Redux Toolkit**, **Tailwind CSS**, and **Radix UI**. Designed for seamless collaboration and productivity, this frontend connects to a RESTful backend to provide a real-time project management experience.

🌐 **Live Frontend URL**: [https://project-management-client-lake.vercel.app](https://project-management-client-lake.vercel.app)

---

## ✨ Features

- 🧑‍💼 User Authentication and Session Management
- 🗂️ Project and Ticket Management UI
- 🧭 Kanban Board Interface (To Do / In Progress / Done)
- 🎨 Dark/Light Theme Toggle with `next-themes`
- ⚛️ Global State Management with Redux Toolkit + Persist
- 📆 Date Management with `date-fns`
- 📦 API Integration using Axios
- 💬 Toast Notifications via `sonner`
- 🧩 Beautiful Components using Radix UI + Lucide Icons

---

## 🧰 Tech Stack

- **Next.js 15**
- **React 19**
- **Redux Toolkit + Redux Persist**
- **Tailwind CSS v4**
- **Radix UI** (for accessible components)
- **Lucide React** (icons)
- **Axios** (API handling)
- **next-themes** (theme switching)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/project-management-app.git
cd project-management-app/client
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Set Up Environment Variables
Create a .env.local file in the root of the frontend and add:
```env
NEXT_PUBLIC_API_BASE_URL=https://project-management-server-t25s.onrender.com
Replace with your actual backend API URL if different.
```
### 4. Run the App Locally
```bash
npm run dev
```
Open http://localhost:3000 in your browser to view the app.

### 📁 Folder Structure (Simplified)
```lua

client/
├── app/
│   ├── page.tsx (Home)
│   └── ...
├── components/
│   ├── ui/
│   └── common/
├── redux/
│   ├── store.ts
│   └── slices/
├── public/
├── tailwind.config.js
├── .env.local
└── package.json
```
### 📦 Dependencies
```json

{
  "next": "15.3.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@reduxjs/toolkit": "^2.8.2",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0",
  "axios": "^1.9.0",
  "tailwindcss": "^4",
  "next-themes": "^0.4.6",
  "lucide-react": "^0.513.0",
  "sonner": "^2.0.5",
  "radix-ui": "...",
  "date-fns": "^4.1.0"
}
```
### 🔗 API Connection
All requests are made to the backend hosted at:

```arduino
https://project-management-server-t25s.onrender.com
```
Ensure CORS is properly configured on the backend to accept requests from the Vercel frontend URL.


### 👥 Contributing
Pull requests and suggestions are welcome. Please open issues for bugs or feature requests before starting a major change.
