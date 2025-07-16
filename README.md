# 📝 Taskify - Project Management App

Repositori ini berisi dua bagian utama:

- `frontend/` — Aplikasi Frontend menggunakan **Next.js**
- `backend/` — RESTful API menggunakan **Express.js** dan **Prisma** untuk ORM

---
API Documentation: https://documenter.getpostman.com/view/30175213/2sB34iiym1
---

## 🚀 Cara Menjalankan Project

### 💻 Backend (Express + Prisma + PostgreSQL)

# Masuk ke folder backend
cd backend

# Salin file .env

# Edit .env agar sesuai dengan PostgreSQL 
# Gunakan VSCode, Notepad, atau terminal text editor:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/next"

# Buat database di PostgreSQL (jika belum)
createdb next

# Install dependencies
npm install

# Migrasi database dan generate Prisma Client
npx prisma migrate dev --name init
npx prisma generate

# (Opsional) Buka antarmuka visual database
npx prisma studio

# Jalankan server backend
npm run dev
# Backend aktif di http://localhost:3001

### 💻 FrontEnd (Next.js + Tailwind.css)
# Buka terminal baru lalu masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
# Frontend aktif di http://localhost:3000

