Design System Language: SynergyHub "Neural Emerald"

Dokumen ini berfungsi sebagai instruksi gaya (style guide) untuk membangun antarmuka SynergyHub PWA. Fokus utamanya adalah Kejelasan Teknis dan Kepuasan Visual (Dopamine Loop).

1. Identitas Visual & Filosofi

Tema Utama: Cyber-Minimalism.

Vibe: Profesional, bersih, bertenaga, dan futuristik namun tetap manusiawi.

Target Emosi: Perasaan "naik level" setiap kali tugas selesai.

2. Palet Warna (The Dopamine Palette)

Gunakan variabel CSS berikut untuk konsistensi:

Background (Deep Slate): #0F172A (Memberikan kesan fokus dan teknis).

Surface/Card (Glassmorphism): rgba(30, 41, 59, 0.7) dengan border rgba(255, 255, 255, 0.1).

Primary Accent (Emerald Glow): #10B981 (Warna pertumbuhan dan keberhasilan).

Secondary Accent (Indigo Tech): #6366F1 (Warna kecerdasan dan engineering).

Danger/Alert: #F43F5E (Digunakan sangat jarang).

Text Primary: #F8FAFC.

Text Secondary: #94A3B8.

3. Tipografi (Typography)

Main Font: Inter (Sans-serif) - Untuk keterbacaan tinggi di mobile.

Mono Font: JetBrains Mono - Digunakan khusus untuk angka progres, label teknis, dan skor XP untuk memberikan nuansa "Coding/Engineering".

4. Komponen UI & Efek Visual

Silo Cards: Menggunakan efek Glassmorphism dengan backdrop-blur. Saat di-hover atau aktif, berikan inner-glow sesuai warna tema Silo tersebut.

Progress Bars: Bukan sekadar bar datar. Gunakan gradien dari Indigo ke Emerald. Berikan efek pulsing (denyut) pelan saat progres di atas 80%.

Checkboxes: Saat dicentang, jangan hanya muncul tanda centang, tapi buat kotak tersebut "meledak" kecil (micro-animation) dan berubah menjadi cahaya Emerald.

5. Motion Design (The Dopamine Triggers)

Transition: Gunakan easing: [0.4, 0, 0.2, 1] untuk semua transisi (smooth & snappy).

Victory Animation: Saat satu Silo mencapai 100%, munculkan Canvas Confetti dengan warna Emerald dan Indigo selama 1.5 detik.

Haptic Feedback: Setiap klik pada tugas harus memicu getaran singkat (vibration) jika diakses via mobile.

6. Prompt Instruksi untuk AI Agent

Copy-paste prompt ini ke AI koding kamu untuk hasil maksimal:

"Implementasikan UI SynergyHub menggunakan Next.js dan Tailwind CSS. Gunakan tema 'Neural Emerald': Background Slate-950, kartu menggunakan Glassmorphism (bg-slate-900/70, border-white/10, backdrop-blur). Font utama Inter, angka menggunakan Mono font. Setiap progres bar harus memiliki gradien Emerald ke Indigo. Pastikan ada animasi 'spring' dari Framer Motion saat user mencentang habit, dan gunakan canvas-confetti saat progres mencapai 100%. Desain harus mobile-first, sangat bersih, dan terlihat seperti dashboard engineering premium."

Didesain oleh: Information Architecture Team