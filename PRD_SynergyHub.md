Product Requirements Document (PRD) - SynergyHub PWA
1. Overview
SynergyHub PWA adalah pusat kendali produktivitas modular yang dirancang untuk membantu pengguna mengelola berbagai domain kehidupan secara dinamis. Berbeda dengan pengelola tugas tradisional yang kaku, aplikasi ini memungkinkan pengguna untuk membuat "Silos" (wadah) khusus untuk setiap kebutuhan—mulai dari tugas harian pengembangan diri (AI, musik, olahraga) hingga jadwal perawatan aset fisik (perawatan motor, rumah). Visi utamanya adalah menciptakan sistem operasi personal yang memberikan kontrol penuh atas struktur data serta visualisasi progres yang memicu dopamin tinggi untuk membangun disiplin yang konsisten.
2. Requirements
2.1 Functional Requirements
Modular Silo System: Pengguna dapat membuat, mengedit, dan menghapus kategori tugas (Silo) secara dinamis dengan kustomisasi ikon dan tema warna.
Hybrid Task Logic: Mendukung dua tipe tugas utama: Daily Tasks (reset otomatis setiap tengah malam) dan Checklist Tasks (manual reset/periodik).
Global Tracking: Sistem pelacakan terpadu yang mencatat histori penyelesaian tugas di seluruh Silo untuk visualisasi jangka panjang.
Real-time Synchronization: Data harus tersinkronisasi secara instan antar perangkat melalui backend cloud.
Offline Access: Kemampuan untuk tetap mencatat aktivitas saat tidak ada koneksi internet dan melakukan sinkronisasi saat kembali online.
2.2 Non-Functional Requirements
High Performance: Waktu muat dashboard utama harus di bawah 1 detik (<1s).
Mobile-First PWA: Aplikasi harus dapat diinstal di home screen HP dan responsif di berbagai ukuran layar.
Ultra-Smooth UI: Animasi dan transisi harus berjalan di 60 FPS untuk memberikan umpan balik yang memuaskan.
Security: Menggunakan Row Level Security (RLS) pada database untuk memastikan privasi data pengguna.
2.3 User Experience (UX)
Frictionless Entry: Autentikasi cepat (Magic Link/Social Login) dan akses satu ketukan untuk mencentang tugas.
Dopamine Feedback Loop: Penggunaan getaran haptic, animasi sukses, dan progress bar reaktif untuk memberikan hadiah psikologis instan.
Visual Hierarchy: Penggunaan skema warna yang kontras untuk membedakan antar Silo secara intuitif.
3. Core Features
Dynamic Silo Lobby: Dashboard utama berisi kartu-kartu interaktif (Silo) dengan mini progress bar sebagai indikator progres harian global.
Multiverse Task Engine: Dashboard interior di setiap Silo untuk manajemen tugas spesifik (add/edit/delete) dengan kontrol tipe tugas yang fleksibel.
Dopamine Feedback System: Efek visual berupa konfeti minimalis dan transisi warna gradien saat sebuah tugas atau seluruh Silo mencapai 100%.
Unified Contribution Heatmap: Grafik kontribusi bergaya GitHub yang merangkum total produktivitas harian dari seluruh aktivitas di semua Silo.
Quick Action: Kemampuan mencentang tugas favorit langsung dari halaman depan tanpa perlu masuk ke dalam detail Silo.
4. User Flow
Setup & Customization: Pengguna login -> Membuat Silo baru (misal: "Maintenance Motor") -> Pilih ikon & warna -> Input daftar tugas di dalamnya.
Daily Execution: Pengguna membuka aplikasi -> Melihat status semua Silo di Lobby -> Klik Silo -> Centang tugas -> Mendapatkan feedback visual (konfeti/animasi).
Review & Tracking: Pengguna melakukan scroll ke bawah di Lobby -> Melihat histori konsistensi pada Heatmap -> Melihat detail aktivitas per tanggal.
Silo Management: Pengguna melakukan long press pada kartu Silo -> Masuk ke mode edit -> Menambah atau mengubah urutan tugas -> Simpan otomatis ke cloud.
5. Architecture
Frontend Architecture: Next.js (App Router) sebagai kerangka kerja utama dengan Client-side Rendering (CSR) untuk interaktivitas tinggi.
State Management: Zustand untuk mengelola state aplikasi secara global (Silo data & task status) agar perpindahan antar halaman terasa instan.
Backend-as-a-Service: Supabase menangani PostgreSQL, Autentikasi, dan Real-time subscription.
PWA Engine: Service Workers via next-pwa untuk caching aset statis dan Offline Persistence menggunakan IndexedDB melalui TanStack Query.
6. Database Schema
profiles: Menyimpan identitas dasar pengguna (id, email, full_name).
categories: Menyimpan definisi Silo (id, user_id, name, icon, color_theme).
tasks: Menyimpan definisi tugas di dalam Silo (id, category_id, title, task_type).
task_logs: Mencatat histori penyelesaian (id, task_id, completed_at, is_completed).
Indexing pada completed_at untuk performa query Heatmap.
7. Tech Stack
Framework: Next.js (App Router)
Language: TypeScript
Styling: Tailwind CSS
Animations: Framer Motion & Canvas-Confetti
Backend/Database: Supabase (PostgreSQL + RLS)
State Management: Zustand
Data Fetching: TanStack Query (React Query)
Icons: Lucide React
Deployment: Vercel (Edge Network)

