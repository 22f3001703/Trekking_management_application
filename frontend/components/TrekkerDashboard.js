const TrekkerDashboard = {
    template: `
    <div class="d-flex min-vh-100 bg-light">
        <!-- Sidebar -->
        <div class="bg-dark text-white p-3 d-flex flex-column justify-content-between" style="width: 260px; min-width: 260px; max-width: 260px; flex-shrink: 0; min-height: 100vh;">
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

            <!-- Global Alert -->
            <div v-if="alertMessage" class="alert alert-dismissible fade show mb-4" :class="alertType" role="alert">
                <i class="bi bi-info-circle me-2"></i>{{ alertMessage }}
                <button type="button" class="btn-close" @click="alertMessage = ''"></button>
            </div>

            <!-- Tab Panels -->
            <div class="bg-white p-4 rounded shadow-sm">
                <!-- Dashboard Panel -->
                <div v-if="activeTab === 'dashboard'">
                    <h5 class="fw-bold mb-3">Trekker Overview</h5>
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <div class="card bg-primary text-white border-0 shadow-sm" style="cursor: pointer;" @click="activeTab = 'browse-treks'">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">Available Treks</h6>
                                            <h3 class="card-title mb-0 fw-bold">{{ treks.length }}</h3>
                                        </div>
                                        <i class="bi bi-compass fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-success text-white border-0 shadow-sm" style="cursor: pointer;" @click="activeTab = 'my-bookings'">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="card-subtitle mb-1 opacity-75">My Booked Treks</h6>
                                            <h3 class="card-title mb-0 fw-bold">{{ activeBookingsCount }}</h3>
                                        </div>
                                        <i class="bi bi-journal-check fs-1 opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="fw-bold mb-0">Featured Upcoming Treks</h6>
                        <button class="btn btn-sm btn-outline-primary" @click="activeTab = 'browse-treks'">View All Treks</button>
                    </div>

                    <div class="row row-cols-1 row-cols-md-3 g-3" v-if="featuredTreks.length > 0">
                        <div class="col" v-for="t in featuredTreks" :key="t.id">
                            <div class="card h-100 shadow-sm border-0" style="overflow: hidden;">
                                <div class="position-relative overflow-hidden" style="height: 160px;">
                                    <img
                                        :src="t.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'"
                                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                        alt="Trek photo"
                                    >
                                    <div class="position-absolute top-0 start-0 m-2">
                                        <span class="badge" :class="difficultyBadge(t.difficulty)">{{ t.difficulty }}</span>
                                    </div>
                                </div>
                                <div class="card-body d-flex flex-column pb-2">
                                    <h6 class="fw-bold text-dark mb-1 text-truncate">{{ t.name }}</h6>
                                    <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ t.location }}</p>
                                    <div class="mt-auto d-flex justify-content-between align-items-center">
                                        <span class="fw-bold text-success">₹{{ t.price }}</span>
                                        <button class="btn btn-sm btn-primary" @click="openDetailModal(t)">Book Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Browse Treks Panel -->
                <div v-else-if="activeTab === 'browse-treks'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">Browse & Explore Treks</h5>
                            <small class="text-muted">Find your next mountain adventure and book slots online</small>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm" @click="fetchTreks">
                            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>

                    <!-- Search and Filters Bar -->
                    <div class="row g-2 mb-4 bg-light p-3 rounded border">
                        <div class="col-md-6">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                                <input 
                                    type="text" 
                                    v-model="searchQuery" 
                                    class="form-control" 
                                    placeholder="Search by trek name or location..."
                                >
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select v-model="filterDifficulty" class="form-select form-select-sm">
                                <option value="">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select v-model="filterStatus" class="form-select form-select-sm">
                                <option value="">All Statuses</option>
                                <option value="Open">Open Only</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                            </select>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loadingTreks" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="text-muted mt-2 small">Loading available treks...</p>
                    </div>

                    <!-- Trek Cards Grid -->
                    <div class="row row-cols-1 row-cols-md-3 g-3" v-else-if="filteredTreks.length > 0">
                        <div class="col" v-for="t in filteredTreks" :key="t.id">
                            <div class="card h-100 shadow-sm border-0" style="overflow: hidden; transition: transform 0.2s;" @click="openDetailModal(t)">
                                <!-- Trek Image & Badges -->
                                <div class="position-relative overflow-hidden" style="height: 180px;">
                                    <img
                                        :src="t.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'"
                                        style="width: 100%; height: 100%; object-fit: cover; display: block;"
                                        alt="Trek photo"
                                        @error="$event.target.src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'"
                                    >
                                    <div class="position-absolute top-0 start-0 m-2">
                                        <span class="badge" :class="difficultyBadge(t.difficulty)">{{ t.difficulty }}</span>
                                    </div>
                                    <div class="position-absolute top-0 end-0 m-2">
                                        <span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span>
                                    </div>
                                </div>

                                <!-- Card Body -->
                                <div class="card-body d-flex flex-column pb-2">
                                    <h6 class="card-title fw-bold text-dark mb-1 text-truncate">{{ t.name }}</h6>
                                    <p class="text-muted small mb-2 text-truncate">
                                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ t.location }}
                                    </p>
                                    <div class="d-flex flex-wrap gap-2 mb-3 small">
                                        <span class="text-muted"><i class="bi bi-clock me-1"></i>{{ t.duration_days }} days</span>
                                        <span class="text-muted"><i class="bi bi-people me-1"></i>{{ t.available_slots }} slots left</span>
                                    </div>

                                    <div class="mt-auto d-flex align-items-center justify-content-between pt-2 border-top">
                                        <div>
                                            <small class="text-muted d-block" style="font-size: 10px;">PRICE</small>
                                            <span class="fw-bold text-success fs-6">₹{{ t.price }}</span>
                                        </div>
                                        <div class="d-flex gap-1">
                                            <button class="btn btn-outline-secondary btn-sm" @click.stop="openDetailModal(t)" title="View Details">
                                                <i class="bi bi-info-circle"></i> Details
                                            </button>
                                            <button 
                                                v-if="isBooked(t.id)" 
                                                class="btn btn-success btn-sm disabled" 
                                                disabled
                                            >
                                                <i class="bi bi-check-circle me-1"></i> Booked
                                            </button>
                                            <button 
                                                v-else-if="t.status !== 'Open'" 
                                                class="btn btn-secondary btn-sm disabled" 
                                                disabled
                                            >
                                                <i class="bi bi-lock me-1"></i> {{ t.status === 'Closed' ? 'Closed' : 'Not Open' }}
                                            </button>
                                            <button 
                                                v-else-if="t.available_slots <= 0" 
                                                class="btn btn-secondary btn-sm disabled" 
                                                disabled
                                            >
                                                Sold Out
                                            </button>
                                            <button 
                                                v-else 
                                                class="btn btn-primary btn-sm" 
                                                @click.stop="bookTrek(t)"
                                                :disabled="bookingInProgress === t.id"
                                            >
                                                <span v-if="bookingInProgress === t.id" class="spinner-border spinner-border-sm me-1"></span>
                                                <i v-else class="bi bi-ticket-perforated me-1"></i> Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-5 text-muted border rounded">
                        <i class="bi bi-compass fs-1 mb-2 d-block text-secondary"></i>
                        <h6 class="fw-bold mb-1">No Treks Match Your Criteria</h6>
                        <p class="mb-0 text-muted small">Try adjusting your search query or difficulty filters.</p>
                    </div>
                </div>

                <!-- My Bookings Panel -->
                <div v-else-if="activeTab === 'my-bookings'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">My Booked Treks</h5>
                            <small class="text-muted">Manage your active trek registrations</small>
                        </div>
                        <button class="btn btn-outline-secondary btn-sm" @click="fetchUserBookings">
                            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
                        </button>
                    </div>

                    <div class="table-responsive" v-if="myBookings.length > 0">
                        <table class="table table-hover align-middle border">
                            <thead class="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Trek</th>
                                    <th>Location</th>
                                    <th>Difficulty</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Booking Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(b, index) in myBookings" :key="b.id">
                                    <td>{{ index + 1 }}</td>
                                    <td class="fw-semibold text-dark">{{ b.trek_name }}</td>
                                    <td>{{ b.location }}</td>
                                    <td><span class="badge" :class="difficultyBadge(b.difficulty)">{{ b.difficulty }}</span></td>
                                    <td>{{ b.duration_days }} days</td>
                                    <td class="fw-semibold text-success">₹{{ b.price }}</td>
                                    <td>{{ b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A' }}</td>
                                    <td>
                                        <span class="badge" :class="bookingStatusBadge(b.status)">
                                            {{ b.status }}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            v-if="b.status === 'Booked'" 
                                            class="btn btn-sm btn-outline-danger" 
                                            @click="cancelBookingConfirm(b)"
                                        >
                                            <i class="bi bi-x-circle me-1"></i> Cancel
                                        </button>
                                        <span v-else class="text-muted small">Cancelled</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center py-5 text-muted border rounded">
                        <i class="bi bi-journal-check fs-1 mb-2 d-block text-secondary"></i>
                        <h6 class="fw-bold mb-1">No Active Bookings</h6>
                        <p class="mb-2 text-muted small">You haven't registered for any trek yet.</p>
                        <button class="btn btn-primary btn-sm" @click="activeTab = 'browse-treks'">Browse Available Treks</button>
                    </div>
                </div>

                <!-- History Panel -->
                <div v-else-if="activeTab === 'history'">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold mb-0">Trekking History</h5>
                            <small class="text-muted">View past completed treks and export booking records</small>
                        </div>
                        <div class="d-flex gap-2">
                            <button 
                                class="btn btn-success btn-sm" 
                                @click="exportBookingHistory"
                                :disabled="exportInProgress"
                            >
                                <span v-if="exportInProgress" class="spinner-border spinner-border-sm me-1"></span>
                                <i v-else class="bi bi-file-earmark-spreadsheet me-1"></i>
                                {{ exportInProgress ? exportStatusText : 'Export All Bookings (CSV)' }}
                            </button>
                        </div>
                    </div>
                    <p class="text-muted">View past completed treks and records.</p>
                    <div class="table-responsive" v-if="completedBookings.length > 0">
                        <table class="table table-hover align-middle border">
                            <thead class="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Trek</th>
                                    <th>Location</th>
                                    <th>Difficulty</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Trek Dates</th>
                                    <th>Booked On</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(b, index) in completedBookings" :key="b.id">
                                    <td>{{ index + 1 }}</td>
                                    <td class="fw-semibold text-dark">{{ b.trek_name }}</td>
                                    <td>{{ b.location }}</td>
                                    <td><span class="badge" :class="difficultyBadge(b.difficulty)">{{ b.difficulty }}</span></td>
                                    <td>{{ b.duration_days }} days</td>
                                    <td class="fw-semibold text-success">₹{{ b.price }}</td>
                                    <td>
                                        <span v-if="b.start_date">{{ new Date(b.start_date).toLocaleDateString() }}</span>
                                        <span v-if="b.start_date && b.end_date"> - </span>
                                        <span v-if="b.end_date">{{ new Date(b.end_date).toLocaleDateString() }}</span>
                                        <span v-if="!b.start_date && !b.end_date" class="text-muted">N/A</span>
                                    </td>
                                    <td>{{ b.booking_date ? new Date(b.booking_date).toLocaleDateString() : 'N/A' }}</td>
                                    <td><span class="badge bg-info text-white">Completed</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="text-center py-5 text-muted border rounded">
                        <i class="bi bi-clock-history fs-1 mb-2 d-block text-secondary"></i>
                        <p class="mb-0">No past completed treks recorded yet.</p>
                    </div>
                </div>

                <!-- Profile Panel -->
                <div v-else-if="activeTab === 'profile'">
                    <h5 class="fw-bold mb-3">My Profile</h5>
                    <div class="card border-0 bg-light p-3" style="max-width: 500px;">
                        <div class="mb-3">
                            <label class="form-label text-muted small">Name</label>
                            <div class="fw-bold text-dark">{{ userName }}</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted small">Email</label>
                            <div class="fw-bold text-dark">{{ userEmail }}</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted small">Role</label>
                            <div><span class="badge bg-success">Trekker Account</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail & Booking Modal -->
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
                        <div class="position-relative rounded overflow-hidden mb-4" style="height: 240px;">
                            <img
                                :src="detailTrek.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'"
                                style="width: 100%; height: 100%; object-fit: cover;"
                                alt="Trek detail photo"
                            >
                            <div class="position-absolute top-0 start-0 m-3 d-flex gap-2">
                                <span class="badge fs-6" :class="difficultyBadge(detailTrek.difficulty)">{{ detailTrek.difficulty }}</span>
                                <span class="badge fs-6" :class="statusBadge(detailTrek.status)">{{ detailTrek.status }}</span>
                            </div>
                        </div>

                        <!-- Info Tiles -->
                        <h6 class="fw-bold mb-3 text-uppercase text-secondary small">Trek Overview</h6>
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
                                    <div class="fw-bold text-success fs-5">₹{{ detailTrek.price }}</div>
                                </div>
                            </div>
                            <div class="col-md-3 col-6">
                                <div class="p-3 bg-light rounded text-center border">
                                    <div class="text-muted small">Available Slots</div>
                                    <div class="fw-bold">{{ detailTrek.available_slots }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Dates -->
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

                        <!-- Description -->
                        <div class="mb-4" v-if="detailTrek.description">
                            <h6 class="fw-bold mb-2 text-uppercase text-secondary small">Description</h6>
                            <p class="text-muted bg-light p-3 rounded border mb-0 small" style="white-space: pre-line;">{{ detailTrek.description }}</p>
                        </div>
                    </div>
                    <div class="modal-footer bg-light d-flex justify-content-between">
                        <button type="button" class="btn btn-secondary btn-sm" @click="closeDetailModal">Close</button>
                        
                        <button 
                            v-if="isBooked(detailTrek.id)" 
                            class="btn btn-success disabled" 
                            disabled
                        >
                            <i class="bi bi-check-circle me-1"></i> Already Booked
                        </button>
                        <button 
                            v-else-if="detailTrek.status !== 'Open'" 
                            class="btn btn-secondary disabled" 
                            disabled
                        >
                            <i class="bi bi-lock me-1"></i> {{ detailTrek.status === 'Closed' ? 'Booking Closed' : 'Trek Not Open' }}
                        </button>
                        <button 
                            v-else-if="detailTrek.available_slots <= 0" 
                            class="btn btn-secondary disabled" 
                            disabled
                        >
                            Sold Out
                        </button>
                        <button 
                            v-else 
                            class="btn btn-primary" 
                            @click="bookTrek(detailTrek)"
                            :disabled="bookingInProgress === detailTrek.id"
                        >
                            <span v-if="bookingInProgress === detailTrek.id" class="spinner-border spinner-border-sm me-1"></span>
                            <i v-else class="bi bi-ticket-perforated me-1"></i> Book This Trek Now (₹{{ detailTrek.price }})
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Red Pop-up Modal -->
        <div v-if="showErrorModal" class="modal d-block bg-dark bg-opacity-50" tabindex="-1" style="z-index: 1070;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title fw-bold d-flex align-items-center">
                            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i> Booking Conflict / Error
                        </h5>
                        <button type="button" class="btn-close btn-close-white" @click="showErrorModal = false"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="d-flex align-items-start gap-3">
                            <div class="text-danger flex-shrink-0">
                                <i class="bi bi-x-circle-fill display-6"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold text-dark mb-2">Unable to Complete Request</h6>
                                <p class="text-secondary mb-0 small" style="line-height: 1.5;">
                                    {{ errorMessage }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light border-top-0">
                        <button type="button" class="btn btn-danger btn-sm px-4 fw-semibold" @click="showErrorModal = false">
                            <i class="bi bi-x-lg me-1"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'dashboard',
            userName: 'Trekker',
            userEmail: '',
            userId: null,
            currentDate: new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
            navItems: [
                { id: 'dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
                { id: 'browse-treks', label: 'Browse Treks', icon: 'bi bi-compass' },
                { id: 'my-bookings', label: 'My Bookings', icon: 'bi bi-journal-check' },
                { id: 'history', label: 'History', icon: 'bi bi-clock-history' },
                { id: 'profile', label: 'Profile', icon: 'bi bi-person' }
            ],
            treks: [],
            myBookings: [],
            loadingTreks: false,
            searchQuery: '',
            filterDifficulty: '',
            filterStatus: '',
            showDetailModal: false,
            detailTrek: null,
            bookingInProgress: null,
            alertMessage: '',
            alertType: 'alert-success',
            showErrorModal: false,
            errorMessage: '',
            // CSV Export State
            exportInProgress: false,
            exportTaskId: null,
            exportStatusText: 'Processing...',
            exportPollTimer: null
        }
    },
    computed: {
        activeTabLabel() {
            const item = this.navItems.find(n => n.id === this.activeTab);
            return item ? item.label : 'Dashboard';
        },
        featuredTreks() {
            return this.treks.slice(0, 3);
        },
        filteredTreks() {
            return this.treks.filter(t => {
                const matchesSearch = !this.searchQuery || 
                    (t.name && t.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                    (t.location && t.location.toLowerCase().includes(this.searchQuery.toLowerCase()));
                
                const matchesDifficulty = !this.filterDifficulty || t.difficulty === this.filterDifficulty;
                const matchesStatus = !this.filterStatus || t.status === this.filterStatus;

                return matchesSearch && matchesDifficulty && matchesStatus;
            });
        },
        activeBookingsCount() {
            return this.myBookings.filter(b => b.status === 'Booked').length;
        },
        completedBookings() {
            return this.myBookings.filter(b => b.status === 'Completed');
        }
    },
    mounted() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.userName = user.name || 'Trekker';
                this.userEmail = user.email || '';
                this.userId = user.id;
            } catch (e) {
                console.error('Failed to parse stored user:', e);
            }
        }
        this.fetchTreks();
        if (this.userId) {
            this.fetchUserBookings();
        }
    },
    methods: {
        async fetchTreks() {
            this.loadingTreks = true;
            try {
                const res = await fetch('/api/treks');
                if (res.ok) {
                    this.treks = await res.json();
                }
            } catch (err) {
                console.error('Error fetching treks:', err);
            } finally {
                this.loadingTreks = false;
            }
        },
        async fetchUserBookings() {
            if (!this.userId) return;
            try {
                const res = await fetch(`/api/bookings/user/${this.userId}`);
                if (res.ok) {
                    this.myBookings = await res.json();
                }
            } catch (err) {
                console.error('Error fetching bookings:', err);
            }
        },
        isBooked(trekId) {
            return this.myBookings.some(b => b.trek_id === trekId && b.status === 'Booked');
        },
        openDetailModal(t) {
            this.detailTrek = t;
            this.showDetailModal = true;
        },
        closeDetailModal() {
            this.showDetailModal = false;
            this.detailTrek = null;
        },
        async bookTrek(trek) {
            if (!this.userId) {
                this.errorMessage = 'Please log in to book a trek.';
                this.showErrorModal = true;
                return;
            }
            this.bookingInProgress = trek.id;
            this.alertMessage = '';

            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: this.userId,
                        trek_id: trek.id
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    this.alertMessage = `Successfully booked "${trek.name}"!`;
                    this.alertType = 'alert-success';
                    this.fetchTreks();
                    this.fetchUserBookings();
                    if (this.detailTrek && this.detailTrek.id === trek.id) {
                        this.closeDetailModal();
                    }
                } else {
                    this.errorMessage = data.error || 'Failed to book trek.';
                    this.showErrorModal = true;
                }
            } catch (err) {
                this.errorMessage = 'Server error processing booking.';
                this.showErrorModal = true;
            } finally {
                this.bookingInProgress = null;
            }
        },
        async cancelBookingConfirm(b) {
            if (!confirm(`Are you sure you want to cancel your booking for "${b.trek_name}"?`)) {
                return;
            }

            try {
                const res = await fetch(`/api/bookings/${b.id}/cancel`, {
                    method: 'PUT'
                });

                const data = await res.json();
                if (res.ok) {
                    this.alertMessage = `Booking for "${b.trek_name}" cancelled.`;
                    this.alertType = 'alert-warning';
                    this.fetchTreks();
                    this.fetchUserBookings();
                } else {
                    this.errorMessage = data.error || 'Failed to cancel booking.';
                    this.showErrorModal = true;
                }
            } catch (err) {
                this.errorMessage = 'Server error cancelling booking.';
                this.showErrorModal = true;
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
        bookingStatusBadge(st) {
            if (st === 'Booked') return 'bg-success';
            if (st === 'Cancelled') return 'bg-danger';
            if (st === 'Completed') return 'bg-info text-white';
            return 'bg-secondary';
        },
        handleLogout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        },
        async exportBookingHistory() {
            if (!this.userId) {
                this.errorMessage = 'Please log in to export booking history.';
                this.showErrorModal = true;
                return;
            }

            this.exportInProgress = true;
            this.exportStatusText = 'Starting export...';

            try {
                const res = await fetch('/api/export/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: this.userId })
                });

                const data = await res.json();
                if (res.ok && data.task_id) {
                    this.exportTaskId = data.task_id;
                    this.exportStatusText = 'Generating CSV...';
                    this.pollExportStatus();
                } else {
                    this.exportInProgress = false;
                    this.errorMessage = data.error || 'Failed to start export.';
                    this.showErrorModal = true;
                }
            } catch (err) {
                this.exportInProgress = false;
                this.errorMessage = 'Server error starting export.';
                this.showErrorModal = true;
            }
        },
        pollExportStatus() {
            if (this.exportPollTimer) clearInterval(this.exportPollTimer);

            this.exportPollTimer = setInterval(async () => {
                try {
                    const res = await fetch(`/api/export/status/${this.exportTaskId}`);
                    const data = await res.json();

                    if (data.state === 'SUCCESS' && data.result) {
                        clearInterval(this.exportPollTimer);
                        this.exportPollTimer = null;
                        this.exportStatusText = 'Download ready!';

                        // Trigger file download
                        const link = document.createElement('a');
                        link.href = `/api/export/download/${data.result.filename}`;
                        link.setAttribute('download', data.result.filename);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        this.alertMessage = `Booking history exported successfully! ${data.result.records} record(s) downloaded.`;
                        this.alertType = 'alert-success';

                        setTimeout(() => { this.exportInProgress = false; }, 1500);
                    } else if (data.state === 'FAILURE') {
                        clearInterval(this.exportPollTimer);
                        this.exportPollTimer = null;
                        this.exportInProgress = false;
                        this.errorMessage = data.error || 'Export job failed.';
                        this.showErrorModal = true;
                    } else {
                        this.exportStatusText = 'Generating CSV...';
                    }
                } catch (err) {
                    clearInterval(this.exportPollTimer);
                    this.exportPollTimer = null;
                    this.exportInProgress = false;
                    this.errorMessage = 'Error polling export status.';
                    this.showErrorModal = true;
                }
            }, 2000);
        }
    }
};
