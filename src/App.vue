<script setup lang="ts">
import PwaInstallPrompt from '@/components/PwaInstallPrompt.vue'
</script>

<template>
  <div data-theme="delicias" class="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans">
    <router-view />
    <PwaInstallPrompt />
  </div>
</template>

