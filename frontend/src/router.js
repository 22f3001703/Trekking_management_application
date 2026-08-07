const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/', redirect: '/login' }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
});
