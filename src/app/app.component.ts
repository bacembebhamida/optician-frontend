import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { OptiAssistantComponent } from './components/assistant/opti-assistant.component';
import { AuthRoleService } from './services/auth-role.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, OptiAssistantComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'OptiVision International Eyewear';
  isAdminRoute = false;

  constructor(private auth: AuthRoleService, private router: Router) {
    this.auth.restoreSession().subscribe();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.isAdminRoute = e.urlAfterRedirects.startsWith('/admin');
    });
  }
}
