# Notes Vyapar 📚

Curating Knowledge for the Future. **Notes Vyapar** is a premium, modern platform designed for students, educators, and lifelong learners to easily buy, sell, and share high-quality, verified study notes and academic artifacts.

🔗 **[Live Platform URL](https://notes-vyapar-env0bin8m-rohn5783s-projects.vercel.app/)**

---

## 🌟 Features

- **Robust Marketplace**: Explore, purchase, and download high-yield study materials spanning diverse subjects such as Computer Science and Medicine.
- **Dedicated Dashboard**: Creators get a comprehensive Workspace overview to track total earnings, active curations, library downloads, and recent artifact activity.
- **Secure Authentication**: End-to-end secure user authentication system seamlessly handling registration, login, and verified email linkage.
- **Premium UI/UX Design**: Sleek, fully responsive, and highly polished dark-mode aesthetic with smooth typography, subtle gradients, and functional micro-interactions.
- **Advanced Filtering**: Quickly find exact study materials by subject, professor, or university using an intuitive search and tagging system.

---

## 🛠️ Technology Stack

Notes Vyapar is built dynamically on a modern, robust Full-Stack architecture:

**Frontend Ecosystem:**
- **[Next.js 16](https://nextjs.org/)** & **[React 19](https://react.dev/)**: For high-performance server-side rendering, dynamic routing, and cutting-edge interactive UIs.
- **[Sass (SCSS)](https://sass-lang.com/)**: Employed for achieving the fluid, component-based styling and scalable design system.
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Lightweight, unopinionated state management for complex UI components.

**Backend & Integration:**
- **[NextAuth.js](https://next-auth.js.org/)**: Dedicated robust authentication flows.
- **[Prisma](https://www.prisma.io/)** & **[Mongoose](https://mongoosejs.com/)**: Powerful ORMs and object data modeling, offering type-safe and scalable database management.
- **[Zod](https://zod.dev/)** & **[React Hook Form](https://react-hook-form.com/)**: Used concurrently for secure, strict, and performant user input validation.
- **[Nodemailer](https://nodemailer.com/) / [Bcrypt.js](https://www.npmjs.com/package/bcryptjs)**: Managing encryption, secure payloads, and dynamic email distribution pipelines.

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/rohn5783/Notes-Vyapar.git
cd notes-vyapar
```

### 2. Install dependencies
Ensure you are using `npm`, `yarn`, `pnpm`, or `bun` inside the actual project directory:
```bash
cd notes-vyapar
npm install
# or bun install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of your internal project directory and populate the required keys:
```env
# Add necessary Auth Secrets, MongoDB URIs, Prisma strings, and Email credentials. 
```

### 4. Start the Development Server
```bash
npm run dev
# or bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🎨 Visuals & Structure

Here’s a quick overview of the platform interfaces:

### Home / Marketplace
"Buy & Sell Notes Easily" with categorized sections (Computer Science, Medicine).
![Home / Marketplace](screenshots/home.png)

### Secure Access
Dedicated `Login` and `Register` pages emphasizing data security ("Secure Entry", "End-to-End").

**Login View:**
![Login Page](screenshots/login.png)

**Register View:**
![Register Page](screenshots/register.png)

### Creator Dashboard
Real-time metrics overview on library sales, earnings, active curations, and artifact history.
![Creator Dashboard](screenshots/dashboard.png)

---

<p align="center">
  <i>Made with ❤️ by Notes Vyapar.</i>
</p>
