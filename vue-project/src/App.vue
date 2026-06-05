<template>
  <Navbar v-if="$route.path !== '/login'" />
  <router-view v-slot="{ Component }">
    <keep-alive :include="['Chat', 'Docs']">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>