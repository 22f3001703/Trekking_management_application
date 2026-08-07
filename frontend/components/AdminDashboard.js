const AdminDashboard = {
    template: `
    <div class="d-flex min-vh-100 bg-light">
        <!-- Sidebar -->
        <div class="bg-dark text-white p-3 d-flex flex-column justify-content-between" style="width: 260px; min-height: 100vh;">
            <div>
                <div class="d-flex align-items-center mb-4 px-2">
                    <i class="bi bi-compass text-primary fs-3 me-2"></i>
                    <span class="fs-5 fw-bold text-white">Trekking Admin</span>
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
                        <span class="badge bg-danger">Admin</span>
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
                    <small class="text-muted">Manage your trekking application</small>
                </div>
                <div class="text-muted small">
                    <i class="bi bi-calendar3 me-1"></i> {{ currentDate }}
                </div>
            </div>

            <!-- Tab Panels -->
            <div class="bg-white p-4 rounded shadow-sm">
                <!-- Dashboard Panel -->
                <div v-if="activeTab === 'dashboard'">
                    <h5 class="fw-bold mb-3">Admin Overview</h5>
                    <div class="row g-3 mb-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Total Treks</h6>
                                            <h3 class="card-title mb-0 fw-bold">{{ treks.length }}</h3>
                                        </div>
                                        <i class="bi bi-compass fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Total Users</h6>
                                            <h3 class="card-title mb-0 fw-bold">0</h3>
                                        </div>
                                        <i class="bi bi-people fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-dark border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Trek Staff</h6>
                                            <h3 class="card-title mb-0 fw-bold">{{ staffList.length }}</h3>
                                        </div>
                                        <i class="bi bi-person-badge fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Total Bookings</h6>
                                            <h3 class="card-title mb-0 fw-bold">0</h3>
                                        </div>
                                        <i class="bi bi-journal-check fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- My Treks Panel -->
                <div v-else-if="activeTab === 'my-treks'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold mb-0">Trekking Routes & Events</h5>
                        <button class="btn btn-primary btn-sm" @click="showAddModal = true">
                            <i class="bi bi-plus-lg me-1"></i> Add New Trek
                        </button>
                    </div>

                    <div v-if="alertMessage" :class="['alert', 'alert-dismissible', 'fade', 'show', alertType]" role="alert">
                        {{ alertMessage }}
                        <button type="button" class="btn-close" @click="alertMessage = ''"></button>
                    </div>

                    <!-- Trek List Table -->
                    <div class="table-responsive" v-if="treks.length > 0">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Trek Name</th>
                                    <th>Location</th>
                                    <th>Difficulty</th>
                                    <th>Duration</th>
                                    <th>Slots</th>
                                    <th>Price</th>
                                    <th>Staff</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="t in treks" :key="t.id">
                                    <td class="fw-semibold text-dark">{{ t.name }}</td>
                                    <td><i class="bi bi-geo-alt text-danger me-1"></i>{{ t.location }}</td>
                                    <td>
                                        <span class="badge" :class="difficultyBadge(t.difficulty)">
                                            {{ t.difficulty }}
                                        </span>
                                    </td>
                                    <td>{{ t.duration_days }} Days</td>
                                    <td>{{ t.available_slots }} slots</td>
                                    <td>₹{{ t.price }}</td>
                                    <td>
                                        <span class="badge bg-secondary">
                                            <i class="bi bi-person me-1"></i>{{ t.assigned_staff_name || 'Unassigned' }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge" :class="statusBadge(t.status)">
                                            {{ t.status }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center py-5 text-muted border rounded">
                        <i class="bi bi-compass fs-1 mb-2"></i>
                        <p class="mb-0">No treks added yet. Click <strong>"Add New Trek"</strong> to create one.</p>
                    </div>

                    <!-- Add Trek Modal Overlay -->
                    <div v-if="showAddModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
                        <div class="modal-dialog modal-lg modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title fw-bold">Add New Trek Route</h5>
                                    <button type="button" class="btn-close" @click="closeModal"></button>
                                </div>
                                <div class="modal-body">
                                    <div v-if="formError" class="alert alert-danger mb-3">
                                        {{ formError }}
                                    </div>
                                    <form @submit.prevent="submitTrek">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Trek Name *</label>
                                                <input type="text" class="form-control" v-model="newTrek.name" placeholder="e.g. Kedarkantha Peak Trek" required>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Location *</label>
                                                <input type="text" class="form-control" v-model="newTrek.location" placeholder="e.g. Uttarkashi, Uttarakhand" required>
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label fw-semibold">Difficulty</label>
                                                <select class="form-select" v-model="newTrek.difficulty">
                                                    <option value="Easy">Easy</option>
                                                    <option value="Moderate">Moderate</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label fw-semibold">Duration (Days) *</label>
                                                <input type="number" min="1" class="form-control" v-model="newTrek.duration_days" required>
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label fw-semibold">Available Slots *</label>
                                                <input type="number" min="0" class="form-control" v-model="newTrek.available_slots" required>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Price (₹)</label>
                                                <input type="number" step="0.01" min="0" class="form-control" v-model="newTrek.price" placeholder="0.00">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Assign Trek Staff</label>
                                                <select class="form-select" v-model="newTrek.assigned_staff_id">
                                                    <option value="">-- Select Staff (Optional) --</option>
                                                    <option v-for="s in staffList" :key="s.id" :value="s.id">
                                                        {{ s.name }} ({{ s.email }})
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Start Date</label>
                                                <input type="date" class="form-control" v-model="newTrek.start_date">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">End Date</label>
                                                <input type="date" class="form-control" v-model="newTrek.end_date">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Status</label>
                                                <select class="form-select" v-model="newTrek.status">
                                                    <option value="Open">Open</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label fw-semibold">Image URL (Optional)</label>
                                                <input type="text" class="form-control" v-model="newTrek.image" placeholder="https://example.com/image.jpg">
                                            </div>
                                            <div class="col-12">
                                                <label class="form-label fw-semibold">Description</label>
                                                <textarea class="form-control" rows="3" v-model="newTrek.description" placeholder="Brief description of the trek route..."></textarea>
                                            </div>
                                        </div>
                                        <div class="modal-footer px-0 pb-0 pt-3 mt-3 border-top">
                                            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                                            <button type="submit" class="btn btn-primary" :disabled="submitting">
                                                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                                                {{ submitting ? 'Saving...' : 'Create Trek' }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Trekking Staff Panel -->
                <div v-else-if="activeTab === 'staff'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold mb-0">Trek Staff Management</h5>
                    </div>
                    <p class="text-muted">Assign and manage trek coordinators and staff members.</p>
                </div>

                <!-- Users (Trekkers) Panel -->
                <div v-else-if="activeTab === 'users'">
                    <h5 class="fw-bold mb-3">Users & Trekkers</h5>
                    <p class="text-muted">Manage registered users, view profiles, and update status.</p>
                </div>

                <!-- Booking Panel -->
                <div v-else-if="activeTab === 'booking'">
                    <h5 class="fw-bold mb-3">All Trek Bookings</h5>
                    <p class="text-muted">View and manage all participant trek bookings.</p>
                </div>

                <!-- Search Panel -->
                <div v-else-if="activeTab === 'search'">
                    <h5 class="fw-bold mb-3">Search System</h5>
                    <div class="input-group mb-3 style-search">
                        <input type="text" class="form-control" placeholder="Search routes, users, staff or bookings...">
                        <button class="btn btn-primary" type="button"><i class="bi bi-search"></i> Search</button>
                    </div>
                </div>

                <!-- Reports Panel -->
                <div v-else-if="activeTab === 'reports'">
                    <h5 class="fw-bold mb-3">Reports & Trekking Statistics</h5>
                    <p class="text-muted">System statistics, user engagement, and monthly export reports.</p>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'dashboard',
            userName: 'Admin',
            currentDate: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
            navItems: [
                { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
                { id: 'my-treks', label: 'My Treks', icon: 'bi bi-compass' },
                { id: 'staff', label: 'Trekking Staff', icon: 'bi bi-person-badge' },
                { id: 'users', label: 'Users (Trekkers)', icon: 'bi bi-people' },
                { id: 'booking', label: 'Booking', icon: 'bi bi-journal-check' },
                { id: 'search', label: 'Search', icon: 'bi bi-search' },
                { id: 'reports', label: 'Reports', icon: 'bi bi-bar-chart-line' }
            ],
            treks: [],
            staffList: [],
            showAddModal: false,
            submitting: false,
            alertMessage: '',
            alertType: 'alert-success',
            formError: '',
            newTrek: {
                name: '',
                location: '',
                difficulty: 'Moderate',
                duration_days: 3,
                available_slots: 15,
                price: 5000,
                description: '',
                image: '',
                status: 'Open',
                start_date: '',
                end_date: '',
                assigned_staff_id: ''
            }
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
                this.userName = user.name || 'Admin';
            } catch (e) {
                console.error(e);
            }
        }
        this.fetchTreks();
        this.fetchStaffList();
    },
    methods: {
        async fetchTreks() {
            try {
                const res = await fetch('/api/treks');
                if (res.ok) {
                    this.treks = await res.json();
                }
            } catch (err) {
                console.error('Failed to fetch treks:', err);
            }
        },
        async fetchStaffList() {
            try {
                const res = await fetch('/api/staff-list');
                if (res.ok) {
                    this.staffList = await res.json();
                }
            } catch (err) {
                console.error('Failed to fetch staff list:', err);
            }
        },
        async submitTrek() {
            this.submitting = true;
            this.formError = '';

            try {
                const res = await fetch('/api/treks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newTrek)
                });

                const data = await res.json();

                if (res.ok) {
                    this.alertMessage = 'Trek created successfully!';
                    this.alertType = 'alert-success';
                    this.closeModal();
                    this.fetchTreks();
                } else {
                    this.formError = data.error || 'Failed to create trek.';
                }
            } catch (err) {
                this.formError = 'Server error. Please try again.';
            } finally {
                this.submitting = false;
            }
        },
        closeModal() {
            this.showAddModal = false;
            this.formError = '';
            this.newTrek = {
                name: '',
                location: '',
                difficulty: 'Moderate',
                duration_days: 3,
                available_slots: 15,
                price: 5000,
                description: '',
                image: '',
                status: 'Open',
                start_date: '',
                end_date: '',
                assigned_staff_id: ''
            };
        },
        difficultyBadge(diff) {
            if (diff === 'Easy') return 'bg-success';
            if (diff === 'Hard') return 'bg-danger';
            return 'bg-warning text-dark';
        },
        statusBadge(st) {
            if (st === 'Open') return 'bg-success';
            if (st === 'Closed') return 'bg-secondary';
            if (st === 'Completed') return 'bg-info text-white';
            return 'bg-primary';
        },
        handleLogout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    }
};
