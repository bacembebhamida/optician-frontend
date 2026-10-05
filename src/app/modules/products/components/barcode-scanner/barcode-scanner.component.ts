import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarcodeScannerService } from '../../services/barcode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scanner-bar" [class.scanner-bar--active]="isHardwareListenerActive">

      <!-- Left: Status indicator + Label -->
      <div class="scanner-status">
        <span class="scanner-status__dot" [class.scanner-status__dot--live]="isHardwareListenerActive"></span>
        <span class="scanner-status__label">
          {{ isHardwareListenerActive ? 'Scanner connecté' : 'Scanner inactif' }}
        </span>
      </div>

      <!-- Center: Barcode input -->
      <div class="scanner-input-wrap" [class.scanner-input-wrap--focused]="barcodeFocused" id="barcode-input-zone">
        <i class="fa-solid fa-barcode scanner-input__icon"></i>
        <input
          type="text"
          id="barcode-input"
          [(ngModel)]="manualBarcode"
          (keyup.enter)="submitManualBarcode()"
          (focus)="barcodeFocused = true"
          (blur)="barcodeFocused = false"
          placeholder="Saisir ou scanner un code-barres (EAN-13, SKU)..."
          class="scanner-input__field"
          aria-label="Recherche par code-barres ou SKU"
          autocomplete="off"
          spellcheck="false">
        <button *ngIf="manualBarcode"
                (click)="clearInput()"
                class="scanner-input__clear"
                aria-label="Effacer le code-barres"
                title="Effacer">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <button (click)="submitManualBarcode()"
                class="scanner-input__search"
                aria-label="Lancer la recherche par code-barres"
                title="Rechercher"
                id="btn-barcode-search">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      <!-- Right: Camera button -->
      <button (click)="toggleCameraScannerModal()"
              class="scanner-camera-btn"
              title="Scanner via caméra"
              id="btn-camera-scan"
              [class.scanner-camera-btn--active]="showCameraModal">
        <i class="fa-solid fa-camera"></i>
        <span>Caméra</span>
      </button>

    </div>

    <!-- Camera Scanner Modal -->
    <div *ngIf="showCameraModal"
         class="camera-overlay"
         (click)="toggleCameraScannerModal()"
         role="dialog"
         aria-modal="true"
         aria-label="Scanner de code-barres par caméra"
         id="camera-scanner-modal">

      <div class="camera-modal" (click)="$event.stopPropagation()">

        <!-- Modal Header -->
        <div class="camera-modal__header">
          <div class="camera-modal__title-group">
            <div class="camera-modal__icon">
              <i class="fa-solid fa-camera"></i>
            </div>
            <div>
              <h2 class="camera-modal__title">Scanner par caméra</h2>
              <p class="camera-modal__subtitle">Placez le code-barres dans la fenêtre de scan</p>
            </div>
          </div>
          <button (click)="toggleCameraScannerModal()"
                  class="camera-modal__close"
                  aria-label="Fermer le scanner caméra"
                  id="btn-close-camera-modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Viewfinder -->
        <div class="camera-viewfinder" role="img" aria-label="Zone de scan vidéo">
          <div class="viewfinder__corners">
            <span class="corner corner--tl"></span>
            <span class="corner corner--tr"></span>
            <span class="corner corner--bl"></span>
            <span class="corner corner--br"></span>
          </div>
          <div class="viewfinder__laser"></div>
          <p class="viewfinder__hint">Centrez le code-barres ici</p>
        </div>

        <!-- Modal Footer / Demo -->
        <div class="camera-modal__footer">
          <p class="demo-notice">
            <i class="fa-solid fa-circle-info"></i>
            Mode démonstration — Intégration caméra disponible avec la librairie ZXing
          </p>
          <div class="demo-actions">
            <button (click)="simulateCameraScan('805289307883')"
                    class="btn-demo"
                    id="btn-simulate-scan">
              <i class="fa-solid fa-bolt"></i>
              Simuler un scan (Ray-Ban 805289307883)
            </button>
            <button (click)="toggleCameraScannerModal()"
                    class="btn-cancel-modal"
                    id="btn-cancel-camera-modal">
              Annuler
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Scanner Bar ── */
    .scanner-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #FFFFFF;
      border: 1px solid #E9ECF0;
      border-radius: 13px;
      padding: 0.625rem 1rem;
      box-shadow: 0 1px 3px rgba(17,24,39,0.03);
      transition: border-color 0.2s;
    }
    .scanner-bar--active {
      border-left: 3px solid #059669;
    }

    /* ── Status indicator ── */
    .scanner-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .scanner-status__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #D1D5DB;
      flex-shrink: 0;
      transition: background 0.3s;
    }
    .scanner-status__dot--live {
      background: #059669;
      box-shadow: 0 0 0 3px rgba(5,150,105,0.18);
      animation: pulse-live 2s infinite;
    }
    @keyframes pulse-live {
      0%, 100% { box-shadow: 0 0 0 3px rgba(5,150,105,0.18); }
      50% { box-shadow: 0 0 0 6px rgba(5,150,105,0.08); }
    }
    .scanner-status__label {
      font-size: 0.72rem;
      font-weight: 600;
      color: #9CA3AF;
    }

    /* ── Barcode Input ── */
    .scanner-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      padding: 0.45rem 0.5rem 0.45rem 0.875rem;
      transition: all 0.2s ease;
    }
    .scanner-input-wrap--focused {
      background: #FFFFFF;
      border-color: #C5A880;
      box-shadow: 0 0 0 3px rgba(197,168,128,0.12);
    }
    .scanner-input__icon {
      color: #D97706;
      font-size: 0.975rem;
      flex-shrink: 0;
    }
    .scanner-input__field {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.85rem;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #111827;
      letter-spacing: 0.03em;
    }
    .scanner-input__field::placeholder {
      font-family: inherit;
      font-weight: 400;
      letter-spacing: 0;
      color: #D1D5DB;
      font-size: 0.8rem;
    }
    .scanner-input__clear {
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 0.2rem;
      line-height: 1;
      font-size: 0.75rem;
      transition: color 0.15s;
    }
    .scanner-input__clear:hover { color: #374151; }
    .scanner-input__search {
      background: #111827;
      color: #FFFFFF;
      border: none;
      border-radius: 7px;
      width: 30px;
      height: 30px;
      min-width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .scanner-input__search:hover { background: #1F2937; }

    /* ── Camera button ── */
    .scanner-camera-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.875rem;
      font-size: 0.775rem;
      font-weight: 700;
      color: #374151;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      border-radius: 9px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .scanner-camera-btn:hover { background: #E5E7EB; }
    .scanner-camera-btn--active {
      background: #111827;
      color: #FFFFFF;
      border-color: #111827;
    }
    .scanner-camera-btn i { font-size: 0.8rem; }

    /* ── Camera Overlay ── */
    .camera-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: overlayIn 0.2s ease forwards;
    }
    @keyframes overlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* ── Camera Modal ── */
    .camera-modal {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 460px;
      overflow: hidden;
      box-shadow: 0 25px 60px -12px rgba(0,0,0,0.3);
      animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .camera-modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #F3F4F6;
    }
    .camera-modal__title-group {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .camera-modal__icon {
      width: 40px;
      height: 40px;
      background: #111827;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #C5A880;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .camera-modal__title {
      font-size: 1rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .camera-modal__subtitle {
      font-size: 0.775rem;
      color: #9CA3AF;
      margin: 0.15rem 0 0 0;
    }
    .camera-modal__close {
      width: 36px;
      height: 36px;
      background: #F3F4F6;
      border: none;
      border-radius: 9px;
      color: #6B7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .camera-modal__close:hover { background: #E5E7EB; color: #111827; }

    /* ── Viewfinder ── */
    .camera-viewfinder {
      height: 230px;
      background: #0A0A0A;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .viewfinder__corners {
      position: absolute;
      inset: 0;
    }
    .corner {
      position: absolute;
      width: 24px;
      height: 24px;
      border-color: rgba(197,168,128,0.8);
      border-style: solid;
    }
    .corner--tl { top: 24px; left: 24px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
    .corner--tr { top: 24px; right: 24px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
    .corner--bl { bottom: 24px; left: 24px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
    .corner--br { bottom: 24px; right: 24px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }
    .viewfinder__laser {
      position: absolute;
      left: 24px;
      right: 24px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #C5A880, transparent);
      animation: scanLaser 2.4s ease-in-out infinite;
      border-radius: 1px;
    }
    @keyframes scanLaser {
      0%   { top: 24px; opacity: 1; }
      49%  { opacity: 1; }
      50%  { top: calc(100% - 26px); opacity: 0.7; }
      51%  { opacity: 0.7; }
      100% { top: 24px; opacity: 1; }
    }
    .viewfinder__hint {
      position: absolute;
      bottom: 1rem;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.4);
      pointer-events: none;
    }

    /* ── Modal Footer ── */
    .camera-modal__footer {
      padding: 1.125rem 1.5rem;
      background: #FAFAFA;
      border-top: 1px solid #F3F4F6;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .demo-notice {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #9CA3AF;
      line-height: 1.5;
    }
    .demo-notice i { color: #C5A880; margin-top: 0.1rem; flex-shrink: 0; }
    .demo-actions {
      display: flex;
      gap: 0.625rem;
    }
    .btn-demo {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.65rem 1rem;
      background: #111827;
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-demo:hover { background: #1F2937; }
    .btn-demo i { color: #C5A880; }
    .btn-cancel-modal {
      padding: 0.65rem 1.125rem;
      background: #FFFFFF;
      color: #374151;
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .btn-cancel-modal:hover { background: #F3F4F6; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .scanner-status { display: none; }
      .scanner-bar { padding: 0.5rem 0.75rem; gap: 0.5rem; }
    }
  `]
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  manualBarcode: string = '';
  isHardwareListenerActive: boolean = true;
  showCameraModal: boolean = false;
  barcodeFocused: boolean = false;

  private sub?: Subscription;

  @Output() barcodeScanned = new EventEmitter<string>();

  constructor(private barcodeService: BarcodeScannerService) {}

  ngOnInit(): void {
    this.barcodeService.startHardwareScannerListener();
    this.sub = this.barcodeService.barcodeScanned$.subscribe(event => {
      this.manualBarcode = event.barcode;
      this.barcodeScanned.emit(event.barcode);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.barcodeService.stopHardwareScannerListener();
  }

  submitManualBarcode(): void {
    if (this.manualBarcode.trim()) {
      this.barcodeService.emitScan(this.manualBarcode.trim(), 'MANUAL_INPUT');
    }
  }

  clearInput(): void {
    this.manualBarcode = '';
    this.barcodeScanned.emit('');
  }

  toggleCameraScannerModal(): void {
    this.showCameraModal = !this.showCameraModal;
  }

  simulateCameraScan(barcode: string): void {
    this.barcodeService.emitScan(barcode, 'CAMERA');
    this.showCameraModal = false;
  }
}
