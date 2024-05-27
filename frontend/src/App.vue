



<template>
  <header>

  </header>

  <main>
    <Menu />
    <router-view />
  </main>
</template>
<script>
import { createApp } from 'vue';
import Menu from './components/Menu.vue';
export default {
  name: 'App',
  components: {
    Menu
  },
 
}


</script>
<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
