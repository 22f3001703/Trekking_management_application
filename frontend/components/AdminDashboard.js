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

            <!-- Global Alert -->
            <div v-if="alertMessage" :class="['alert', 'alert-dismissible', 'fade', 'show', alertType]" role="alert">
                {{ alertMessage }}
                <button type="button" class="btn-close" @click="alertMessage = ''"></button>
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
                                            <h3 class="card-title mb-0 fw-bold">{{ fullStaffList.length }}</h3>
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
                                        <span :class="['badge', t.assigned_staff_name && t.assigned_staff_name !== 'Unassigned' ? 'bg-secondary' : 'bg-danger']">
                                            <i class="bi bi-person me-1"></i>{{ t.assigned_staff_name || 'Not allotted' }}
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
                        <button class="btn btn-primary btn-sm" @click="showAddStaffModal = true">
                            <i class="bi bi-person-plus me-1"></i> Add Staff Member
                        </button>
                    </div>

                    <!-- Staff List Table -->
                    <div class="table-responsive" v-if="fullStaffList.length > 0">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Specialization</th>
                                    <th>Experience</th>
                                    <th>Assigned Treks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="s in fullStaffList" :key="s.id">
                                    <td class="fw-semibold text-dark">{{ s.name }}</td>
                                    <td>{{ s.email }}</td>
                                    <td>{{ s.phone || 'N/A' }}</td>
                                    <td><span class="badge bg-light text-dark border">{{ s.specialization || 'General Guide' }}</span></td>
                                    <td>{{ s.experience_years }} yrs</td>
                                    <td>
                                        <span :class="['badge', s.assigned_treks_count > 0 ? 'bg-info text-white' : 'bg-secondary']">
                                            {{ s.assigned_treks_count }} trek(s)
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary me-1" @click="openEditStaffModal(s)">
                                            <i class="bi bi-pencil"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="deleteStaffConfirm(s)">
                                            <i class="bi bi-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center py-5 text-muted border rounded">
                        <i class="bi bi-person-badge fs-1 mb-2"></i>
                        <p class="mb-0">No staff members found. Click <strong>"Add Staff Member"</strong> to add one.</p>
                    </div>

                    <!-- Add Staff Modal -->
                    <div v-if="showAddStaffModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title fw-bold">Add New Staff Member</h5>
                                    <button type="button" class="btn-close" @click="closeStaffModal"></button>
                                </div>
                                <div class="modal-body">
                                    <div v-if="staffFormError" class="alert alert-danger mb-3">
                                        {{ staffFormError }}
                                    </div>
                                    <form @submit.prevent="submitStaff">
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Full Name *</label>
                                            <input type="text" class="form-control" v-model="newStaff.name" placeholder="John Guide" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Email Address *</label>
                                            <input type="email" class="form-control" v-model="newStaff.email" placeholder="staff@example.com" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Password *</label>
                                            <input type="password" class="form-control" v-model="newStaff.password" placeholder="Account password" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Phone Number</label>
                                            <input type="tel" class="form-control" v-model="newStaff.phone" placeholder="+1234567890">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Specialization</label>
                                            <input type="text" class="form-control" v-model="newStaff.specialization" placeholder="High-altitude trekking, First Aid">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Experience (Years)</label>
                                            <input type="number" min="0" class="form-control" v-model="newStaff.experience_years">
                                        </div>
                                        <div class="modal-footer px-0 pb-0 pt-3 border-top">
                                            <button type="button" class="btn btn-secondary" @click="closeStaffModal">Cancel</button>
                                            <button type="submit" class="btn btn-primary" :disabled="staffSubmitting">
                                                <span v-if="staffSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                                                {{ staffSubmitting ? 'Creating...' : 'Create Staff' }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Staff Modal -->
                    <div v-if="showEditStaffModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title fw-bold">Edit Staff Member</h5>
                                    <button type="button" class="btn-close" @click="closeStaffModal"></button>
                                </div>
                                <div class="modal-body">
                                    <div v-if="staffFormError" class="alert alert-danger mb-3">
                                        {{ staffFormError }}
                                    </div>
                                    <form @submit.prevent="updateStaffSubmit">
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Full Name *</label>
                                            <input type="text" class="form-control" v-model="editStaff.name" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Email Address *</label>
                                            <input type="email" class="form-control" v-model="editStaff.email" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Password (Leave blank to keep current)</label>
                                            <input type="password" class="form-control" v-model="editStaff.password" placeholder="New password">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Phone Number</label>
                                            <input type="tel" class="form-control" v-model="editStaff.phone">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Specialization</label>
                                            <input type="text" class="form-control" v-model="editStaff.specialization">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label fw-semibold">Experience (Years)</label>
                                            <input type="number" min="0" class="form-control" v-model="editStaff.experience_years">
                                        </div>
                                        <div class="modal-footer px-0 pb-0 pt-3 border-top">
                                            <button type="button" class="btn btn-secondary" @click="closeStaffModal">Cancel</button>
                                            <button type="submit" class="btn btn-primary" :disabled="staffSubmitting">
                                                <span v-if="staffSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                                                {{ staffSubmitting ? 'Updating...' : 'Save Changes' }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
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
            fullStaffList: [],
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
            },
            showAddStaffModal: false,
            showEditStaffModal: false,
            staffSubmitting: false,
            staffFormError: '',
            newStaff: {
                name: '',
                email: '',
                password: '',
                phone: '',
                specialization: '',
                experience_years: 1
            },
            editStaff: {
                id: null,
                name: '',
                email: '',
                password: '',
                phone: '',
                specialization: '',
                experience_years: 0
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
        this.fetchFullStaff();
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
        async fetchFullStaff() {
            try {
                const res = await fetch('/api/staff');
                if (res.ok) {
                    this.fullStaffList = await res.json();
                }
            } catch (err) {
                console.error('Failed to fetch full staff:', err);
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
        async submitStaff() {
            this.staffSubmitting = true;
            this.staffFormError = '';

            try {
                const res = await fetch('/api/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newStaff)
                });

                const data = await res.json();

                if (res.ok) {
                    this.alertMessage = 'Staff member created successfully!';
                    this.alertType = 'alert-success';
                    this.closeStaffModal();
                    this.fetchFullStaff();
                    this.fetchStaffList();
                } else {
                    this.staffFormError = data.error || 'Failed to create staff member.';
                }
            } catch (err) {
                this.staffFormError = 'Server error. Please try again.';
            } finally {
                this.staffSubmitting = false;
            }
        },
        openEditStaffModal(staffMember) {
            this.editStaff = {
                id: staffMember.id,
                name: staffMember.name,
                email: staffMember.email,
                password: '',
                phone: staffMember.phone || '',
                specialization: staffMember.specialization || '',
                experience_years: staffMember.experience_years || 0
            };
            this.showEditStaffModal = true;
        },
        async updateStaffSubmit() {
            this.staffSubmitting = true;
            this.staffFormError = '';

            try {
                const res = await fetch(`/api/staff/${this.editStaff.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.editStaff)
                });

                const data = await res.json();

                if (res.ok) {
                    this.alertMessage = 'Staff member updated successfully!';
                    this.alertType = 'alert-success';
                    this.closeStaffModal();
                    this.fetchFullStaff();
                    this.fetchStaffList();
                    this.fetchTreks();
                } else {
                    this.staffFormError = data.error || 'Failed to update staff member.';
                }
            } catch (err) {
                this.staffFormError = 'Server error. Please try again.';
            } finally {
                this.staffSubmitting = false;
            }
        },
        async deleteStaffConfirm(staffMember) {
            if (!confirm(`Are you sure you want to delete staff member "${staffMember.name}"? Any assigned treks will be set to Not Allotted.`)) {
                return;
            }

            try {
                const res = await fetch(`/api/staff/${staffMember.id}`, {
                    method: 'DELETE'
                });

                const data = await res.json();

                if (res.ok) {
                    this.alertMessage = data.message || 'Staff member deleted.';
                    this.alertType = 'alert-warning';
                    // Re-fetch staff AND treks immediately so deleted staff's treks show "Not allotted"
                    this.fetchFullStaff();
                    this.fetchStaffList();
                    this.fetchTreks();
                } else {
                    alert(data.error || 'Failed to delete staff member.');
                }
            } catch (err) {
                alert('Server error while deleting staff member.');
            }
        },
        closeStaffModal() {
            this.showAddStaffModal = false;
            this.showEditStaffModal = false;
            this.staffFormError = '';
            this.newStaff = {
                name: '',
                email: '',
                password: '',
                phone: '',
                specialization: '',
                experience_years: 1
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
