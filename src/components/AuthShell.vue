<script setup>
// Shared auth layout: animated medical hero (left) + glass form panel (right).
// For a looping video, put a file in /public and add <video autoplay muted loop playsinline> inside .hero.
</script>
<template>
  <div class="auth">
    <aside class="hero">
      <div class="orb" style="width: 260px; height: 260px; top: -60px; right: -60px"></div>
      <div
        class="orb"
        style="width: 140px; height: 140px; top: 45%; left: 8%; animation-delay: -3s"
      ></div>
      <svg
        class="pulse"
        viewBox="0 0 400 80"
        fill="none"
        stroke="#fff"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M0 40h120l20-30 30 60 25-45 15 15h190" />
      </svg>
      <h1>Every appointment, in its place.</h1>
      <p>Book, confirm and track patient visits across departments without the paperwork.</p>
    </aside>
    <main class="formside">
      <div class="glass"><slot /></div>
    </main>
  </div>
</template>
