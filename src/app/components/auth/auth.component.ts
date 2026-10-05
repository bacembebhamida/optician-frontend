import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthRoleService, LoginCredentials } from '../../services/auth-role.service';

export type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'FORGOT_SUCCESS';
export type AppLang = 'FR' | 'EN' | 'AR';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  // ── State ────────────────────────────────────────────────────────────
  mode: AuthMode = 'LOGIN';
  lang: AppLang = 'FR';

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  passwordConfirm = '';
  rememberMe = false;
  acceptTerms = false;

  // UX State
  showPassword = false;
  showPasswordConfirm = false;
  isSubmitting = false;
  errorMessage = '';
  isDemoMode = false;
  passwordStrength: 0 | 1 | 2 | 3 | 4 = 0;

  // Field-level validation
  emailTouched = false;
  passwordTouched = false;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private returnUrl = '/mon-compte';

  readonly langs: { code: AppLang; flag: string; label: string }[] = [
    { code: 'FR', flag: '🇫🇷', label: 'Français' },
    { code: 'EN', flag: '🇬🇧', label: 'English' },
    { code: 'AR', flag: '🇹🇳', label: 'العربية' }
  ];

  // ── Demo credentials ─────────────────────────────────────────────────
  readonly demoCredentials = [
    { label: 'Admin', email: 'admin@optivision.tn', password: 'admin123' },
    { label: 'Client', email: 'client@optivision.tn', password: 'client123' }
  ];

  // ── i18n ─────────────────────────────────────────────────────────────
  get isRTL(): boolean { return this.lang === 'AR'; }

  readonly i18n: Record<AppLang, Record<string, string>> = {
    FR: {
      welcome: 'Bienvenue chez OptiVision',
      subtitle: 'Connectez-vous à votre espace personnel.',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'exemple@email.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      loginBtn: 'Se connecter',
      loggingIn: 'Connexion…',
      noAccount: "Vous n'avez pas encore de compte ?",
      createAccount: 'Créer un compte',
      continueAsGuest: 'Continuer en tant que visiteur',
      guestNote: 'Vous pourrez créer votre compte plus tard.',
      secureNote: 'Vos données sont protégées et sécurisées.',
      orWith: 'ou continuer avec',
      googleBtn: 'Continuer avec Google',
      appleBtn: 'Continuer avec Apple',
      registerTitle: 'Créer votre compte',
      registerSubtitle: 'Rejoignez la communauté OptiVision en quelques secondes.',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Téléphone',
      passwordConfirm: 'Confirmer le mot de passe',
      terms: "J'accepte les conditions générales et la politique de confidentialité.",
      registerBtn: 'Créer mon compte',
      creatingAccount: 'Création en cours…',
      alreadyAccount: 'Vous avez déjà un compte ?',
      signIn: 'Se connecter',
      forgotTitle: 'Mot de passe oublié ?',
      forgotSubtitle: 'Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.',
      sendLink: 'Envoyer le lien',
      sending: 'Envoi en cours…',
      backToLogin: 'Retour à la connexion',
      forgotSuccessTitle: 'E-mail envoyé !',
      forgotSuccessMsg: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception.',
    },
    EN: {
      welcome: 'Welcome to OptiVision',
      subtitle: 'Sign in to your personal space.',
      emailLabel: 'Email address',
      emailPlaceholder: 'example@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      loginBtn: 'Sign in',
      loggingIn: 'Signing in…',
      noAccount: "Don't have an account?",
      createAccount: 'Create account',
      continueAsGuest: 'Continue as guest',
      guestNote: 'You can create an account later.',
      secureNote: 'Your data is protected and secure.',
      orWith: 'or continue with',
      googleBtn: 'Continue with Google',
      appleBtn: 'Continue with Apple',
      registerTitle: 'Create your account',
      registerSubtitle: 'Join the OptiVision community in seconds.',
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone number',
      passwordConfirm: 'Confirm password',
      terms: 'I accept the terms of service and privacy policy.',
      registerBtn: 'Create my account',
      creatingAccount: 'Creating account…',
      alreadyAccount: 'Already have an account?',
      signIn: 'Sign in',
      forgotTitle: 'Forgot your password?',
      forgotSubtitle: 'Enter your email and we will send you a reset link.',
      sendLink: 'Send reset link',
      sending: 'Sending…',
      backToLogin: 'Back to sign in',
      forgotSuccessTitle: 'Email sent!',
      forgotSuccessMsg: 'A reset link has been sent to your email address. Check your inbox.',
    },
    AR: {
      welcome: 'مرحباً بك في OptiVision',
      subtitle: 'سجّل الدخول إلى حسابك الشخصي.',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'مثال@بريد.com',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginBtn: 'تسجيل الدخول',
      loggingIn: '...جارٍ الدخول',
      noAccount: 'ليس لديك حساب؟',
      createAccount: 'إنشاء حساب',
      continueAsGuest: 'المتابعة كزائر',
      guestNote: 'يمكنك إنشاء حساب لاحقاً.',
      secureNote: 'بياناتك محمية وآمنة.',
      orWith: 'أو تابع عبر',
      googleBtn: 'التابع مع Google',
      appleBtn: 'التابع مع Apple',
      registerTitle: 'إنشاء حساب جديد',
      registerSubtitle: 'انضم إلى مجتمع OptiVision في ثوانٍ.',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      phone: 'رقم الهاتف',
      passwordConfirm: 'تأكيد كلمة المرور',
      terms: 'أوافق على الشروط والأحكام وسياسة الخصوصية.',
      registerBtn: 'إنشاء حسابي',
      creatingAccount: '...جارٍ إنشاء الحساب',
      alreadyAccount: 'هل لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      forgotTitle: 'نسيت كلمة المرور؟',
      forgotSubtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
      sendLink: 'إرسال الرابط',
      sending: '...جارٍ الإرسال',
      backToLogin: 'العودة إلى تسجيل الدخول',
      forgotSuccessTitle: 'تم إرسال البريد!',
      forgotSuccessMsg: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. تحقق من صندوق الوارد.',
    }
  };

  t(key: string): string {
    return this.i18n[this.lang][key] ?? key;
  }

  constructor(
    private auth: AuthRoleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.router.navigateByUrl(user.role === 'ADMIN' ? '/admin' : '/mon-compte');
      return;
    }

    this.route.queryParamMap.subscribe(params => {
      const m = params.get('mode');
      this.mode = m === 'register' ? 'REGISTER'
                : m === 'forgot'   ? 'FORGOT_PASSWORD'
                : 'LOGIN';
      this.returnUrl = this.safe(params.get('returnUrl'), '/mon-compte');
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────
  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.clearForm();
  }

  setLang(lang: AppLang): void {
    this.lang = lang;
  }

  // ── Password ─────────────────────────────────────────────────────────
  togglePassword(): void  { this.showPassword = !this.showPassword; }
  togglePasswordConfirm(): void { this.showPasswordConfirm = !this.showPasswordConfirm; }

  onPasswordInput(): void {
    this.passwordTouched = true;
    this.passwordStrength = this.calcStrength(this.password) as 0|1|2|3|4;
  }

  private calcStrength(pw: string): number {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)  s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
  }

  get strengthLabel(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Excellent'][this.passwordStrength];
  }

  get strengthColor(): string {
    return ['', '#EF4444', '#F59E0B', '#10B981', '#059669'][this.passwordStrength];
  }

  // ── Validation ───────────────────────────────────────────────────────
  get emailInvalid(): boolean {
    return this.emailTouched && !!this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  get passwordMismatch(): boolean {
    return this.mode === 'REGISTER' && !!this.passwordConfirm && this.password !== this.passwordConfirm;
  }

  // ── Submit ────────────────────────────────────────────────────────────
  submit(): void {
    if (this.isSubmitting) return;
    this.errorMessage = '';

    if (this.mode === 'LOGIN')          { this.doLogin(); return; }
    if (this.mode === 'REGISTER')       { this.doRegister(); return; }
    if (this.mode === 'FORGOT_PASSWORD'){ this.doForgot(); return; }
  }

  private doLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    const creds: LoginCredentials = { email: this.email.trim(), password: this.password };
    this.isSubmitting = true;

    // Détection automatique du rôle (Admin vs Client)
    const primaryAttempt = this.email.toLowerCase().includes('admin')
      ? this.auth.loginAdmin(creds)
      : this.auth.loginClient(creds);

    const fallbackAttempt = this.email.toLowerCase().includes('admin')
      ? this.auth.loginClient(creds)
      : this.auth.loginAdmin(creds);

    primaryAttempt.subscribe({
      next: profile => this.onLoginSuccess(profile),
      error: () => {
        // En cas d'échec sur le premier endpoint, on tente le second rôle
        fallbackAttempt.subscribe({
          next: profile => this.onLoginSuccess(profile),
          error: err => this.handleError(err)
        });
      }
    });
  }

  private onLoginSuccess(profile: { role: string }): void {
    this.isSubmitting = false;
    this.showToast('Connexion réussie. Bienvenue !', 'success');
    setTimeout(() => this.router.navigateByUrl(
      profile.role === 'ADMIN' ? '/admin' : this.returnUrl
    ), 600);
  }

  private doRegister(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (this.password !== this.passwordConfirm) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (!this.acceptTerms) {
      this.errorMessage = 'Veuillez accepter les conditions générales.';
      return;
    }

    const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
    const creds: LoginCredentials = { email: this.email.trim(), password: this.password };
    this.isSubmitting = true;

    this.auth.register({ fullName, ...creds }).pipe(
      switchMap(() => this.auth.loginClient(creds))
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showToast('Compte créé avec succès. Bienvenue !', 'success');
        setTimeout(() => this.router.navigateByUrl(this.returnUrl), 600);
      },
      error: err => this.handleError(err)
    });
  }

  private doForgot(): void {
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse e-mail.';
      return;
    }
    this.isSubmitting = true;
    // Simulate backend call
    setTimeout(() => {
      this.isSubmitting = false;
      this.mode = 'FORGOT_SUCCESS';
    }, 1800);
  }

  // ── Social ────────────────────────────────────────────────────────────
  loginWithGoogle(): void {
    this.showToast('La connexion Google sera disponible prochainement.', 'info');
  }

  loginWithApple(): void {
    this.showToast('La connexion Apple sera disponible prochainement.', 'info');
  }

  continueAsGuest(): void {
    this.showToast('Mode visiteur activé.', 'info');
    setTimeout(() => this.router.navigate(['/']), 800);
  }

  fillDemo(email: string, pw: string): void {
    this.email = email;
    this.password = pw;
    this.showToast('Identifiants démo remplis !', 'info');
  }

  // ── Toast ─────────────────────────────────────────────────────────────
  showToast(msg: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastType = type;
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 4000);
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  private handleError(err: { status?: number; error?: { message?: string } }): void {
    this.isSubmitting = false;
    this.isDemoMode = false;

    if (err.status === 0 || err.status === 504) {
      this.isDemoMode = true;
      this.errorMessage = '';
      return;
    }
    if (err.status === 401) {
      this.errorMessage = 'Adresse e-mail ou mot de passe incorrect.';
      return;
    }
    if (err.status === 423) {
      this.errorMessage = 'Votre compte est temporairement verrouillé. Veuillez réessayer plus tard.';
      return;
    }
    if (err.status === 409) {
      this.errorMessage = 'Cette adresse e-mail est déjà utilisée.';
      return;
    }
    this.errorMessage = err.error?.message ?? 'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.';
  }

  private clearForm(): void {
    this.errorMessage = '';
    this.isDemoMode = false;
    this.password = '';
    this.passwordConfirm = '';
    this.showPassword = false;
    this.showPasswordConfirm = false;
    this.emailTouched = false;
    this.passwordTouched = false;
    this.passwordStrength = 0;
    this.acceptTerms = false;
  }

  private safe(url: string | null, fallback: string): string {
    return url?.startsWith('/') && !url.startsWith('//') ? url : fallback;
  }
}
