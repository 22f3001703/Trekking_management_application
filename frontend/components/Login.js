const Login = {
    template: `
    <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
        <div class="login-card card shadow-lg border-0">
            <div class="card-body p-5">
                <!-- Logo / Branding -->
                <div class="text-center mb-4">
                    <div class="brand-icon mx-auto mb-3">
                        <i class="bi bi-compass"></i>
                    </div>
                    <h2 class="fw-bold text-dark mb-1">Welcome Back</h2>
                    <p class="text-muted">Sign in to Trekking Management</p>
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
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="bi bi-envelope"></i>
                            </span>
                            <input 
                                type="email" 
                                class="form-control border-start-0 ps-0" 
                                id="email" 
                                v-model="email" 
                                placeholder="you@example.com"
                                required
                            >
                        </div>
                    </div>

                    <div class="mb-4">
                        <label for="password" class="form-label fw-semibold">Password</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="bi bi-lock"></i>
                            </span>
                            <input 
                                :type="showPassword ? 'text' : 'password'" 
                                class="form-control border-start-0 border-end-0 ps-0" 
                                id="password" 
                                v-model="password" 
                                placeholder="Enter your password"
                                required
                            >
                            <span class="input-group-text bg-light border-start-0 cursor-pointer" @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </span>
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
                        <a href="#" class="text-decoration-none fw-semibold">Register here</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
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
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    // TODO: redirect based on role
                    // this.$router.push('/dashboard');
                    alert('Login successful!');
                } else {
                    this.error = data.message || 'Invalid credentials. Please try again.';
                }
            } catch (err) {
                this.error = 'Something went wrong. Please try again later.';
            } finally {
                this.loading = false;
            }
        }
    }
};
