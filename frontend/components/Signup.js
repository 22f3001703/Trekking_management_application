const Signup = {
    template: `
    <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
        <div class="login-card card shadow-lg border-0">
            <div class="card-body p-5">
                <!-- Logo / Branding -->
                <div class="text-center mb-4">
                    <div class="brand-icon mx-auto mb-3">
                        <i class="bi bi-person-plus"></i>
                    </div>
                    <h2 class="fw-bold text-dark mb-1">Create Account</h2>
                    <p class="text-muted">Join Trekking Management as a Trekker</p>
                </div>

                <!-- Alert -->
                <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ error }}
                    <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ success }}
                    <button type="button" class="btn-close" @click="success = ''"></button>
                </div>

                <!-- Signup Form -->
                <form @submit.prevent="handleSignup">
                    <!-- Full Name -->
                    <div class="mb-3">
                        <label for="name" class="form-label fw-semibold">Full Name</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="bi bi-person"></i>
                            </span>
                            <input 
                                type="text" 
                                class="form-control border-start-0 ps-0" 
                                id="name" 
                                v-model="name" 
                                placeholder="John Doe"
                                required
                            >
                        </div>
                    </div>

                    <!-- Email Address -->
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

                    <!-- Phone Number -->
                    <div class="mb-3">
                        <label for="phone" class="form-label fw-semibold">Phone Number (Optional)</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="bi bi-telephone"></i>
                            </span>
                            <input 
                                type="tel" 
                                class="form-control border-start-0 ps-0" 
                                id="phone" 
                                v-model="phone" 
                                placeholder="+1234567890"
                            >
                        </div>
                    </div>

                    <!-- Password -->
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
                                placeholder="Choose a password"
                                required
                            >
                            <span class="input-group-text bg-light border-start-0 cursor-pointer" @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </span>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                        {{ loading ? 'Creating Account...' : 'Sign Up' }}
                    </button>
                </form>

                <!-- Login Link -->
                <div class="text-center mt-4">
                    <p class="text-muted mb-0">
                        Already have an account? 
                        <router-link to="/login" class="text-decoration-none fw-semibold">Sign in</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            name: '',
            email: '',
            phone: '',
            password: '',
            showPassword: false,
            loading: false,
            error: '',
            success: ''
        }
    },
    methods: {
        async handleSignup() {
            this.loading = true;
            this.error = '';
            this.success = '';

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        password: this.password,
                        phone: this.phone
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    this.success = 'Account created successfully! Redirecting to login...';
                    setTimeout(() => {
                        this.$router.push('/login');
                    }, 1500);
                } else {
                    this.error = data.error || 'Registration failed. Please try again.';
                }
            } catch (err) {
                this.error = 'Something went wrong. Please try again later.';
            } finally {
                this.loading = false;
            }
        }
    }
};
