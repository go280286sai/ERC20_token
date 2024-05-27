import { createRouter, createWebHistory } from 'vue-router';
import ContractDev from './components/ContractDev.vue';
import PayClient from './components/PayClient.vue';
import PayServer from './components/PayServer.vue';
import Test from './components/Test.vue';
import Home from './components/Home.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/client', component: PayClient },
  { path: '/server', component: PayServer },
  { path: '/dev', component: ContractDev },
  { path: '/test', component: Test },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
