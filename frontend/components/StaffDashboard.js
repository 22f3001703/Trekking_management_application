const StaffDashboard = {
    template: `
    <div class="d-flex min-vh-100 bg-light">
        <!-- Sidebar -->
        <div class="bg-dark text-white p-3 d-flex flex-column justify-content-between" style="width: 260px; min-width: 260px; max-width: 260px; flex-shrink: 0; min-height: 100vh;">
            <div>
                <div class="d-flex align-items-center mb-4 px-2">
                    <i class="bi bi-compass text-primary fs-3 me-2"></i>
                    <span class="fs-5 fw-bold text-white">Trek Staff</span>
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
                        <span class="badge bg-warning text-dark">Trek Staff</span>
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
                    <small class="text-muted">Staff management console</small>
                </div>
                <div class="text-muted small">
                    <i class="bi bi-calendar3 me-1"></i> {{ currentDate }}
                </div>
            </div>

            <!-- Tab Panels -->
            <div class="bg-white p-4 rounded shadow-sm">
                <!-- Dashboard Panel -->
                <div v-if="activeTab === 'dashboard'">
                    <h5 class="fw-bold mb-3">Staff Overview</h5>
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <div class="card bg-primary text-white border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Assigned Treks</h6>
                                            <h3 class="card-title mb-0 fw-bold">{{ assignedTreks.length }}</h3>
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
                                            <h6 class="card-subtitle mb-1 opacity-75">Registered Participants</h6>
                                            <h3 class="card-title mb-0 fw-bold">{{ totalParticipantsCount }}</h3>
                                        </div>
                                        <i class="bi bi-people fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- My Treks Panel -->
                <div v-else-if="activeTab === 'my-treks'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">My Allotted Treks</h5>
                            <small class="text-muted">Treks currently assigned to you for management</small>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm" @click="fetchAssignedTreks">
                            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>

                    <div v-if="loadingTreks" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="text-muted mt-2 small">Loading your allotted treks...</p>
                    </div>

                    <!-- Treks Photo / Card Grid -->
                    <div class="row row-cols-1 row-cols-md-3 g-3" v-else-if="assignedTreks.length > 0">
                        <div class="col" v-for="t in assignedTreks" :key="t.id">
                            <div class="card h-100 shadow-sm border-0" style="overflow: hidden; cursor: pointer;" @click="openDetailModal(t)">
                                <!-- Trek Image -->
                                <div class="position-relative overflow-hidden" style="height: 190px;">
                                    <img
                                        :src="t.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'"
                                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                        alt="Trek photo"
                                        @error="$event.target.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'"
                                    >
                                    <!-- Badges -->
                                    <div class="position-absolute top-0 start-0 m-2">
                                        <span class="badge" :class="difficultyBadge(t.difficulty)">{{ t.difficulty }}</span>
                                    </div>
                                    <div class="position-absolute top-0 end-0 m-2">
                                        <span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span>
                                    </div>
                                </div>

                                <div class="card-body d-flex flex-column pb-2">
                                    <h6 class="card-title fw-bold text-dark mb-1 text-truncate">{{ t.name }}</h6>
                                    <p class="text-muted small mb-2 text-truncate">
                                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ t.location }}
                                    </p>
                                    <div class="d-flex flex-wrap gap-2 mb-3 small">
                                        <span class="text-muted"><i class="bi bi-clock me-1"></i>{{ t.duration_days }} days</span>
                                        <span class="text-muted"><i class="bi bi-people me-1"></i>{{ t.available_slots }} slots</span>
                                        <span class="fw-semibold text-primary"><i class="bi bi-person-check me-1"></i>{{ t.participants_count }} booked</span>
                                    </div>
                                    <div class="mt-auto">
                                        <button class="btn btn-outline-primary btn-sm w-100" @click.stop="openDetailModal(t)">
                                            <i class="bi bi-eye me-1"></i> View Details & Participants
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-5 text-muted border rounded">
                        <i class="bi bi-compass fs-1 mb-2 d-block text-secondary"></i>
                        <h6 class="fw-bold mb-1">No Treks Allotted</h6>
                        <p class="mb-0 text-muted small">You currently have no trekking trips assigned by the admin.</p>
                    </div>
                </div>

                <!-- Participants Panel -->
                <div v-else-if="activeTab === 'participants'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">All Trek Participants</h5>
                            <small class="text-muted">Participants registered for your assigned treks</small>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm" @click="fetchAssignedTreks">
                            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover align-middle border">
                            <thead class="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Trek Name</th>
                                    <th>Participant Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Booking Date</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody v-if="allParticipants.length > 0">
                                <tr v-for="(p, index) in allParticipants" :key="p.booking_id + '-' + index">
                                    <td>{{ index + 1 }}</td>
                                    <td class="fw-semibold text-primary">{{ p.trek_name }}</td>
                                    <td class="fw-semibold text-dark">{{ p.name }}</td>
                                    <td>{{ p.email }}</td>
                                    <td>{{ p.phone || 'N/A' }}</td>
                                    <td>{{ p.booking_date ? new Date(p.booking_date).toLocaleDateString() : 'N/A' }}</td>
                                    <td><span class="badge bg-success">{{ p.status }}</span></td>
                                    <td><span class="badge bg-info text-white">{{ p.payment_status }}</span></td>
                                </tr>
                            </tbody>
                            <tbody v-else>
                                <tr>
                                    <td colspan="8" class="py-4 text-center text-muted">
                                        <i class="bi bi-people fs-3 d-block mb-1 opacity-50"></i>
                                        No participants registered for any of your assigned treks yet.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail & Participants Modal -->
        <div v-if="showDetailModal && detailTrek" class="modal d-block bg-dark bg-opacity-50" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title fw-bold">
                            <i class="bi bi-compass text-primary me-2"></i>{{ detailTrek.name }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeDetailModal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <!-- Hero Image -->
                        <div class="position-relative rounded overflow-hidden mb-4" style="height: 220px;">
                            <img
                                :src="detailTrek.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'"
                                style="width: 100%; height: 100%; object-fit: cover;"
                                alt="Trek detail image"
                            >
                            <div class="position-absolute top-0 start-0 m-3 d-flex gap-2">
                                <span class="badge fs-6" :class="difficultyBadge(detailTrek.difficulty)">{{ detailTrek.difficulty }}</span>
                                <span class="badge fs-6" :class="statusBadge(detailTrek.status)">{{ detailTrek.status }}</span>
                            </div>
                        </div>

                        <!-- Status Update & Controls Card -->
                        <div class="card border-0 bg-light p-3 mb-4 rounded shadow-sm">
                            <div v-if="detailTrek.status === 'Completed'" class="alert alert-success d-flex align-items-center mb-3">
                                <i class="bi bi-check-circle-fill fs-4 me-2"></i>
                                <div>
                                    <strong class="d-block">Trek Marked as Completed!</strong>
                                    <small>This trip has been finished successfully.</small>
                                </div>
                            </div>

                            <div v-if="statusAlert" class="alert alert-info alert-dismissible fade show py-2 px-3 mb-3 small" role="alert">
                                <i class="bi bi-info-circle me-1"></i>{{ statusAlert }}
                                <button type="button" class="btn-close py-2" @click="statusAlert = ''"></button>
                            </div>

                            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                <div>
                                    <h6 class="fw-bold mb-1 text-dark">
                                        Current Status: <span class="badge ms-1" :class="statusBadge(detailTrek.status)">{{ detailTrek.status }}</span>
                                    </h6>
                                    <small class="text-muted">Update trek operational status or mark complete.</small>
                                </div>

                                <div class="d-flex flex-wrap align-items-center gap-2">
                                    <!-- Dropdown + Update Button -->
                                    <div class="input-group input-group-sm" style="width: auto;">
                                        <select v-model="selectedStatus" class="form-select form-select-sm">
                                            <option value="Open">Open</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        <button 
                                            class="btn btn-primary btn-sm" 
                                            @click="updateTrekStatus(selectedStatus)"
                                            :disabled="updatingStatus"
                                        >
                                            <span v-if="updatingStatus" class="spinner-border spinner-border-sm me-1"></span>
                                            <i v-else class="bi bi-save me-1"></i> Update Status
                                        </button>
                                    </div>

                                    <!-- Individual Mark as Completed Button -->
                                    <button 
                                        class="btn btn-sm"
                                        :class="detailTrek.status === 'Completed' ? 'btn-success disabled' : 'btn-outline-success'"
                                        @click="updateTrekStatus('Completed')"
                                        :disabled="updatingStatus || detailTrek.status === 'Completed'"
                                    >
                                        <i class="bi bi-check-circle-fill me-1"></i>
                                        {{ detailTrek.status === 'Completed' ? 'Completed' : 'Mark as Completed' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Information Tiles -->
                        <h6 class="fw-bold mb-3 text-uppercase text-secondary small">Trip Details</h6>
                        <div class="row g-2 mb-4">
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded text-center border">
                                    <div class="text-muted small">Location</div>
                                    <div class="fw-bold text-truncate" :title="detailTrek.location">{{ detailTrek.location }}</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded text-center border">
                                    <div class="text-muted small">Duration</div>
                                    <div class="fw-bold">{{ detailTrek.duration_days }} Days</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded text-center border">
                                    <div class="text-muted small">Price</div>
                                    <div class="fw-bold text-success">₹{{ detailTrek.price }}</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded text-center border">
                                    <div class="text-muted small">Available Slots</div>
                                    <div class="fw-bold">{{ detailTrek.available_slots }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Dates & Description -->
                        <div class="row mb-4" v-if="detailTrek.start_date || detailTrek.end_date">
                            <div class="col-md-6" v-if="detailTrek.start_date">
                                <small class="text-muted d-block">Start Date</small>
                                <strong class="text-dark">{{ new Date(detailTrek.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</strong>
                            </div>
                            <div class="col-md-6" v-if="detailTrek.end_date">
                                <small class="text-muted d-block">End Date</small>
                                <strong class="text-dark">{{ new Date(detailTrek.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</strong>
                            </div>
                        </div>

                        <div class="mb-4" v-if="detailTrek.description">
                            <h6 class="fw-bold mb-2 text-uppercase text-secondary small">Description</h6>
                            <p class="text-muted bg-light p-3 rounded border mb-0 small" style="white-space: pre-line;">{{ detailTrek.description }}</p>
                        </div>

                        <!-- Participants Section -->
                        <hr class="my-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="fw-bold mb-0 text-uppercase text-secondary small">
                                <i class="bi bi-people-fill text-primary me-1"></i> Participants Registered ({{ detailTrek.participants_count }})
                            </h6>
                        </div>

                        <!-- Participants Table -->
                        <div class="table-responsive" v-if="detailTrek.participants && detailTrek.participants.length > 0">
                            <table class="table table-hover align-middle border mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Booking Date</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(p, index) in detailTrek.participants" :key="p.booking_id">
                                        <td>{{ index + 1 }}</td>
                                        <td class="fw-semibold text-dark">{{ p.name }}</td>
                                        <td>{{ p.email }}</td>
                                        <td>{{ p.phone || 'N/A' }}</td>
                                        <td>{{ p.booking_date ? new Date(p.booking_date).toLocaleDateString() : 'N/A' }}</td>
                                        <td><span class="badge bg-success">{{ p.status }}</span></td>
                                        <td><span class="badge bg-info text-white">{{ p.payment_status }}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- Empty Participants State -->
                        <div v-else class="table-responsive">
                            <table class="table align-middle border text-center mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Booking Date</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="7" class="py-4 text-muted">
                                            <i class="bi bi-inbox fs-3 d-block mb-1 opacity-50"></i>
                                            No participants registered for this trek yet.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary btn-sm" @click="closeDetailModal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'dashboard',
            userName: 'Staff',
            userId: null,
            currentDate: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
            navItems: [
                { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
                { id: 'my-treks', label: 'My Treks', icon: 'bi bi-compass' },
                { id: 'participants', label: 'Participants', icon: 'bi bi-people' }
            ],
            assignedTreks: [],
            loadingTreks: false,
            showDetailModal: false,
            detailTrek: null,
            selectedStatus: '',
            updatingStatus: false,
            statusAlert: ''
        }
    },
    computed: {
        activeTabLabel() {
            const item = this.navItems.find(n => n.id === this.activeTab);
            return item ? item.label : 'Dashboard';
        },
        totalParticipantsCount() {
            return this.assignedTreks.reduce((sum, t) => sum + (t.participants_count || 0), 0);
        },
        allParticipants() {
            const list = [];
            this.assignedTreks.forEach(t => {
                (t.participants || []).forEach(p => {
                    list.push({ ...p, trek_name: t.name, trek_location: t.location });
                });
            });
            return list;
        }
    },
    mounted() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.userName = user.name || 'Staff';
                this.userId = user.id;
                if (this.userId) {
                    this.fetchAssignedTreks();
                }
            } catch (e) {
                console.error('Failed to parse stored user:', e);
            }
        }
    },
    methods: {
        async fetchAssignedTreks() {
            if (!this.userId) return;
            this.loadingTreks = true;
            try {
                const res = await fetch(`/api/staff/${this.userId}/treks`);
                if (res.ok) {
                    this.assignedTreks = await res.json();
                }
            } catch (err) {
                console.error('Failed to fetch assigned treks:', err);
            } finally {
                this.loadingTreks = false;
            }
        },
        openDetailModal(t) {
            this.detailTrek = t;
            this.selectedStatus = t.status || 'Open';
            this.statusAlert = '';
            this.showDetailModal = true;
        },
        closeDetailModal() {
            this.showDetailModal = false;
            this.detailTrek = null;
            this.statusAlert = '';
        },
        async updateTrekStatus(newStatus) {
            if (!this.detailTrek) return;
            this.updatingStatus = true;
            this.statusAlert = '';
            try {
                const res = await fetch(`/api/treks/${this.detailTrek.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                const data = await res.json();
                if (res.ok) {
                    this.detailTrek.status = newStatus;
                    this.selectedStatus = newStatus;
                    this.statusAlert = `Trek status updated to "${newStatus}"!`;
                    this.fetchAssignedTreks();
                } else {
                    alert(data.error || 'Failed to update status.');
                }
            } catch (err) {
                alert('Server error updating status.');
            } finally {
                this.updatingStatus = false;
            }
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
