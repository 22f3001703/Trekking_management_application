const Login = {
    template: `
    <div class="auth-bg d-flex align-items-center justify-content-center">
        <div class="card auth-card shadow border-0 my-5">
            <div class="card-body p-4 p-md-5">
                <!-- Branding -->
                <div class="text-center mb-4">
                    <h2 class="fw-bold text-primary mb-1">Trekking App</h2>
                    <p class="text-muted">Sign in to your account</p>
                </div>

                <!-- Role Selection -->
                <div class="mb-4">
                    <label class="form-label fw-semibold text-dark">Select Role</label>
                    <div class="btn-group w-100" role="group">
                        <input type="radio" class="btn-check" name="role" id="roleTrekker" value="trekker" v-model="role" autocomplete="off">
                        <label class="btn btn-outline-primary" for="roleTrekker">Trekker</label>

                        <input type="radio" class="btn-check" name="role" id="roleStaff" value="staff" v-model="role" autocomplete="off">
                        <label class="btn btn-outline-primary" for="roleStaff">Trek Staff</label>

                        <input type="radio" class="btn-check" name="role" id="roleAdmin" value="admin" v-model="role" autocomplete="off">
                        <label class="btn btn-outline-primary" for="roleAdmin">Admin</label>
                    </div>
                </div>

                <!-- Alert -->
                <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ error }}
                    <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin">
                    <div class="mb-3">
                        <label for="email" class="form-label fw-semibold">Email address</label>
                        <input 
                            type="email" 
                            class="form-control" 
                            id="email" 
                            v-model="email" 
                            placeholder="name@example.com"
                            required
                        >
                    </div>

                    <div class="mb-4">
                        <label for="password" class="form-label fw-semibold">Password</label>
                        <div class="input-group">
                            <input 
                                :type="showPassword ? 'text' : 'password'" 
                                class="form-control" 
                                id="password" 
                                v-model="password" 
                                placeholder="Enter password"
                                required
                            >
                            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                        {{ loading ? 'Signing in...' : 'Sign In' }}
                    </button>
                </form>

                <!-- Register Link -->
                <div class="text-center mt-4">
                    <p class="text-muted mb-0">
                        Don't have an account? 
                        <router-link to="/signup" class="text-decoration-none fw-semibold">Register here</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            role: 'trekker',
            email: '',
            password: '',
            showPassword: false,
            loading: false,
            error: ''
        }
    },
    methods: {
        async handleLogin() {
            this.loading = true;
            this.error = '';

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password,
                        role: this.role
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect based on user role
                    if (data.user.role === 'admin') {
                        this.$router.push('/admin/dashboard');
                    } else if (data.user.role === 'staff') {
                        this.$router.push('/staff/dashboard');
                    } else {
                        this.$router.push('/trekker/dashboard');
                    }
                } else {
                    this.error = data.error || 'Invalid credentials. Please try again.';
                }
            } catch (err) {
                this.error = 'Something went wrong. Please try again later.';
            } finally {
                this.loading = false;
            }
        }
    }
};
