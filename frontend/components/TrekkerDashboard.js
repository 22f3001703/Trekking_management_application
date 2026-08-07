const TrekkerDashboard = {
    template: `
    <div class="d-flex min-vh-100 bg-light">
        <!-- Sidebar -->
        <div class="bg-dark text-white p-3 d-flex flex-column justify-content-between" style="width: 260px; min-height: 100vh;">
            <div>
                <div class="d-flex align-items-center mb-4 px-2">
                    <i class="bi bi-compass text-primary fs-3 me-2"></i>
                    <span class="fs-5 fw-bold text-white">Trekker Portal</span>
                </div>
                <div class="text-secondary small mb-3 px-2">NAVIGATION</div>
                <div class="nav nav-pills flex-column">
                    <button 
                        v-for="item in navItems" 
                        :key="item.id"
                        class="nav-link text-start mb-1 d-flex align-items-center"
                        :class="{ 'active': activeTab === item.id, 'text-white-50': activeTab !== item.id }"
                        @click="activeTab = item.id"
                    >
                        <i :class="item.icon" class="me-2 fs-5"></i>
                        <span>{{ item.label }}</span>
                    </button>
                </div>
            </div>

            <!-- User Info & Logout -->
            <div class="border-top border-secondary pt-3 mt-3 px-2">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <div class="fw-semibold text-white small">Hi, {{ userName }}</div>
                        <span class="badge bg-success">Trekker</span>
                    </div>
                    <button @click="handleLogout" class="btn btn-outline-light btn-sm" title="Logout">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-grow-1 p-4 overflow-auto">
            <!-- Header Bar -->
            <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
                <div>
                    <h4 class="mb-0 fw-bold text-dark">{{ activeTabLabel }}</h4>
                    <small class="text-muted">Welcome to your trekking hub</small>
                </div>
                <div class="text-muted small">
                    <i class="bi bi-calendar3 me-1"></i> {{ currentDate }}
                </div>
            </div>

            <!-- Tab Panels -->
            <div class="bg-white p-4 rounded shadow-sm">
                <!-- Dashboard Panel -->
                <div v-if="activeTab === 'dashboard'">
                    <h5 class="fw-bold mb-3">Trekker Overview</h5>
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <div class="card bg-primary text-white border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Available Treks</h6>
                                            <h3 class="card-title mb-0 fw-bold">0</h3>
                                        </div>
                                        <i class="bi bi-compass fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-success text-white border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">My Booked Treks</h6>
                                            <h3 class="card-title mb-0 fw-bold">0</h3>
                                        </div>
                                        <i class="bi bi-journal-check fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Browse Treks Panel -->
                <div v-else-if="activeTab === 'browse-treks'">
                    <h5 class="fw-bold mb-3">Browse & Search Treks</h5>
                    <p class="text-muted">Explore upcoming treks, filter by difficulty, location, and duration.</p>
                </div>

                <!-- My Bookings Panel -->
                <div v-else-if="activeTab === 'my-bookings'">
                    <h5 class="fw-bold mb-3">My Bookings</h5>
                    <p class="text-muted">View your current active trek bookings and status.</p>
                </div>

                <!-- History Panel -->
                <div v-else-if="activeTab === 'history'">
                    <h5 class="fw-bold mb-3">Trekking History</h5>
                    <p class="text-muted">View completed past treks and export your trekking history.</p>
                </div>

                <!-- Profile Panel -->
                <div v-else-if="activeTab === 'profile'">
                    <h5 class="fw-bold mb-3">My Profile</h5>
                    <p class="text-muted">Manage your profile information, password, and contact details.</p>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'dashboard',
            userName: 'Trekker',
            currentDate: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
            navItems: [
                { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
                { id: 'browse-treks', label: 'Browse Treks', icon: 'bi bi-compass' },
                { id: 'my-bookings', label: 'My Bookings', icon: 'bi bi-journal-check' },
                { id: 'history', label: 'History', icon: 'bi bi-clock-history' },
                { id: 'profile', label: 'Profile', icon: 'bi bi-person' }
            ]
        }
    },
    computed: {
        activeTabLabel() {
            const item = this.navItems.find(n => n.id === this.activeTab);
            return item ? item.label : 'Dashboard';
        }
    },
    mounted() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.userName = user.name || 'Trekker';
            } catch (e) {
                console.error(e);
            }
        }
    },
    methods: {
        handleLogout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    }
};
