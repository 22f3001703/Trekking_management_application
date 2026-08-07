const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/', redirect: '/login' }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
});
