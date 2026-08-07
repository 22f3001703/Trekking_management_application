const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/admin/dashboard', name: 'AdminDashboard', component: AdminDashboard },
    { path: '/staff/dashboard', name: 'StaffDashboard', component: StaffDashboard },
    { path: '/trekker/dashboard', name: 'TrekkerDashboard', component: TrekkerDashboard },
    { path: '/', redirect: '/login' }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
});
