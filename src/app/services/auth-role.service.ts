import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

export type UserRole = 'CLIENT' | 'ADMIN';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  fullName: string;
}

// ── Comptes de démonstration (aucun backend requis) ──────────────────────────
const DEMO_USERS: (UserProfile & { passwords: string[] })[] = [
  { id: 1, email: 'admin@optivision.tn', passwords: ['Admin123!', 'admin123'], fullName: 'Direction OptiVision Admin', role: 'ADMIN' },
  { id: 2, email: 'client@optivision.tn', passwords: ['client123', 'Client123!'], fullName: 'Sophie Martin', role: 'CLIENT' },
  { id: 3, email: 'demo@optivision.tn', passwords: ['demo1234', 'Demo1234!'], fullName: 'Utilisateur Démo', role: 'CLIENT' },
];

@Injectable({
  providedIn: 'root'
})
export class AuthRoleService {

  private readonly authUrl = 'http://localhost:8080/api/auth';
  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(null);

  // Cache observable pour restoreSession — réinitialisé après chaque logout
  private sessionRestore$?: Observable<UserProfile | null>;

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ── Inscription ────────────────────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<UserProfile> {
    return this.http
      .post<UserProfile>(`${this.authUrl}/register`, payload, { withCredentials: true })
      .pipe(
        catchError(() => {
          // Mode démo : on simule la création de compte
          const newUser: UserProfile = {
            id: Date.now(),
            email: payload.email,
            fullName: payload.fullName,
            role: 'CLIENT'
          };
          return of(newUser);
        })
      );
  }

  // ── Connexion client ───────────────────────────────────────────────────────
  loginClient(credentials: LoginCredentials): Observable<UserProfile> {
    return this.authenticate('/login', credentials, 'CLIENT');
  }

  // ── Connexion admin ────────────────────────────────────────────────────────
  loginAdmin(credentials: LoginCredentials): Observable<UserProfile> {
    return this.authenticate('/admin/login', credentials, 'ADMIN');
  }

  // ── Restauration de session ────────────────────────────────────────────────
  restoreSession(): Observable<UserProfile | null> {
    // Si déjà un utilisateur en mémoire, retour immédiat
    const current = this.currentUserSubject.value;
    if (current) {
      return of(current);
    }

    if (!this.sessionRestore$) {
      this.sessionRestore$ = this.http
        .get<UserProfile>(`${this.authUrl}/me`, { withCredentials: true })
        .pipe(
          tap(profile => this.storeSession(profile)),
          catchError(() => {
            // Backend indisponible → session vide (pas d'erreur)
            this.currentUserSubject.next(null);
            return of(null);
          }),
          shareReplay(1)
        );
    }
    return this.sessionRestore$;
  }

  // ── Déconnexion ────────────────────────────────────────────────────────────
  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.authUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(void 0);
        })
      );
  }

  // ── Utilitaires ────────────────────────────────────────────────────────────
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // ── Privé ─────────────────────────────────────────────────────────────────
  private authenticate(
    path: string,
    credentials: LoginCredentials,
    expectedRole: UserRole
  ): Observable<UserProfile> {
    return this.http
      .post<UserProfile>(`${this.authUrl}${path}`, credentials, { withCredentials: true })
      .pipe(
        tap(profile => this.storeSession(profile)),
        catchError(err => {
          // Si le backend est inaccessible, on tente le mode démo
          if (err.status === 0 || err.status === 504) {
            return this.demoLogin(credentials, expectedRole);
          }
          throw err;
        })
      );
  }

  /** Authentification hors-ligne avec les comptes de démonstration */
  private demoLogin(credentials: LoginCredentials, expectedRole: UserRole): Observable<UserProfile> {
    const demo = DEMO_USERS.find(
      u => u.email.toLowerCase() === credentials.email.toLowerCase()
        && u.passwords.includes(credentials.password)
        && u.role === expectedRole
    );

    if (!demo) {
      throw { status: 401, error: { message: 'Identifiants incorrects (mode démo).' } };
    }

    const { passwords: _pw, ...profile } = demo;
    this.storeSession(profile);
    return of(profile);
  }

  private storeSession(profile: UserProfile): void {
    this.currentUserSubject.next(profile);
    // On écrase le cache avec la valeur courante pour court-circuiter les futures requêtes
    this.sessionRestore$ = of(profile).pipe(shareReplay(1));
  }

  private clearSession(): void {
    this.currentUserSubject.next(null);
    // ← BUG FIX : on réinitialise le cache pour forcer un nouveau /me au prochain accès
    this.sessionRestore$ = undefined;
  }
}
