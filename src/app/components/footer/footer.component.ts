import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  newsletterEmail: string = '';
  newsletterSuccess: boolean = false;

  subscribeNewsletter(): void {
    if (!this.newsletterEmail) return;
    this.newsletterSuccess = true;
    this.newsletterEmail = '';
  }
}
