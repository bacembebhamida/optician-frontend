import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-barcode-scanner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop font-sans">
      <div class="modal-card animate-fade-in">
        
        <!-- Header -->
        <div class="modal-head">
          <div class="head-title">
            <div class="scan-icon-box">
              <i class="fa-solid fa-barcode"></i>
            </div>
            <div>
              <h3 class="modal-title font-bold">Scanner de Code-Barres / SKU</h3>
              <p class="modal-sub">Compatible avec douchettes USB &amp; caméra optique</p>
            </div>
          </div>
          
          <button (click)="onClose.emit()" class="btn-close" title="Fermer"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Scanner Viewport Graphic -->
        <div class="scanner-viewport">
          <div class="scan-laser-line"></div>
          <div class="scan-overlay-corners">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
          </div>
          <div class="scan-status-text">
            <span class="pulse-dot"></span> Prêt pour la lecture automatique...
          </div>
        </div>

        <!-- Input Box -->
        <div class="scan-input-section">
          <label class="scan-label font-semibold">Code-barres scanné ou saisi :</label>
          <div class="input-wrap">
            <i class="fa-solid fa-barcode input-ic"></i>
            <input 
              type="text" 
              [(ngModel)]="scannedCode" 
              (keyup.enter)="submitScan()"
              placeholder="Ex: 805289307883..." 
              class="scan-input font-mono font-bold"
              autofocus>
            <button (click)="submitScan()" [disabled]="!scannedCode" class="btn-scan-submit font-bold">
              Rechercher <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Test Presets Quick Buttons -->
        <div class="presets-section">
          <span class="presets-label">Démonstration rapide (Codes-barres réels) :</span>
          <div class="presets-chips">
            <button 
              *ngFor="let preset of testPresets" 
              (click)="selectPreset(preset.code)" 
              class="preset-chip font-mono">
              <span class="preset-name font-sans">{{ preset.name }}</span>
              <span class="preset-code">{{ preset.code }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      width: 100%;
      max-width: 520px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.25);
    }

    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .head-title { display: flex; align-items: center; gap: 0.85rem; }
    .scan-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .modal-title { font-size: 1.15rem; color: #0F172A; }
    .modal-sub { font-size: 0.775rem; color: #64748B; }
    .btn-close {
      background: #F1F5F9;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      color: #64748B;
      cursor: pointer;
    }

    .scanner-viewport {
      height: 140px;
      background: #0F172A;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .scan-laser-line {
      position: absolute;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #EF4444;
      box-shadow: 0 0 12px 2px #EF4444;
      animation: scanLaser 2s infinite ease-in-out;
    }
    @keyframes scanLaser {
      0% { top: 20%; }
      50% { top: 80%; }
      100% { top: 20%; }
    }
    .scan-overlay-corners .corner {
      position: absolute;
      width: 24px;
      height: 24px;
      border: 3px solid #C5A880;
    }
    .corner.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
    .corner.top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
    .corner.bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
    .corner.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

    .scan-status-text {
      color: #94A3B8;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      z-index: 2;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    .scan-input-section { margin-bottom: 1.25rem; }
    .scan-label { font-size: 0.8rem; color: #475569; display: block; margin-bottom: 0.4rem; }
    .input-wrap { position: relative; display: flex; align-items: center; }
    .input-ic { position: absolute; left: 0.85rem; color: #94A3B8; }
    .scan-input {
      width: 100%;
      padding: 0.75rem 7rem 0.75rem 2.4rem;
      border: 2px solid #CBD5E1;
      border-radius: 12px;
      font-size: 0.95rem;
    }
    .scan-input:focus {
      outline: none;
      border-color: #C5A880;
    }
    .btn-scan-submit {
      position: absolute;
      right: 0.4rem;
      background: #0F172A;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.45rem 0.85rem;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .presets-section { border-top: 1px solid #F1F5F9; padding-top: 1rem; }
    .presets-label { font-size: 0.75rem; color: #64748B; font-weight: 600; display: block; margin-bottom: 0.5rem; }
    .presets-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .preset-chip {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 0.35rem 0.65rem;
      cursor: pointer;
      text-align: left;
      display: flex;
      flex-direction: column;
    }
    .preset-chip:hover { border-color: #C5A880; background: #FFFDF9; }
    .preset-name { font-size: 0.75rem; color: #0F172A; font-weight: 700; }
    .preset-code { font-size: 0.7rem; color: #64748B; }
  `]
})
export class BarcodeScannerModalComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() onScan = new EventEmitter<string>();

  scannedCode: string = '';

  testPresets = [
    { name: 'Ray-Ban Optical', code: '805289307883' },
    { name: 'Tom Ford Luxury', code: '889214051240' },
    { name: 'Ray-Ban Aviator', code: '805289004829' },
    { name: 'Gucci Oversized', code: '889652109844' },
    { name: 'Oakley Radar EV', code: '888392001452' }
  ];

  selectPreset(code: string): void {
    this.scannedCode = code;
    this.submitScan();
  }

  submitScan(): void {
    if (this.scannedCode.trim()) {
      this.onScan.emit(this.scannedCode.trim());
      this.onClose.emit();
    }
  }
}
