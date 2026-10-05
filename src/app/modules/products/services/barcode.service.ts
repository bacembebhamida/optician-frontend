import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface BarcodeScanEvent {
  barcode: string;
  timestamp: Date;
  source: 'USB_SCANNER' | 'MANUAL_INPUT' | 'CAMERA';
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeScannerService {
  private barcodeScannedSubject = new Subject<BarcodeScanEvent>();
  readonly barcodeScanned$: Observable<BarcodeScanEvent> = this.barcodeScannedSubject.asObservable();

  private buffer: string = '';
  private lastKeyTime: number = 0;
  private isListening: boolean = false;

  startHardwareScannerListener(): void {
    if (this.isListening) return;
    this.isListening = true;

    window.addEventListener('keydown', this.handleKeyDown);
  }

  stopHardwareScannerListener(): void {
    if (!this.isListening) return;
    this.isListening = false;
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Barcode scanners act as rapid keyboard inputs ending with 'Enter'
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastKeyTime;
    this.lastKeyTime = currentTime;

    // Ignore input if user is actively typing inside a form text input/textarea
    const activeElem = document.activeElement;
    const isInputFocused = activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.tagName === 'SELECT');

    if (isInputFocused && timeDiff > 50) {
      // Normal human typing inside an input field
      return;
    }

    if (event.key === 'Enter') {
      if (this.buffer.length >= 4) {
        this.emitScan(this.buffer, 'USB_SCANNER');
      }
      this.buffer = '';
    } else if (event.key.length === 1) {
      if (timeDiff > 100) {
        this.buffer = '';
      }
      this.buffer += event.key;
    }
  };

  emitScan(barcode: string, source: BarcodeScanEvent['source'] = 'MANUAL_INPUT'): void {
    const cleaned = barcode.trim();
    if (cleaned) {
      this.barcodeScannedSubject.next({
        barcode: cleaned,
        timestamp: new Date(),
        source
      });
    }
  }

  validateBarcode(barcode: string): boolean {
    if (!barcode) return false;
    const clean = barcode.trim();
    // Validates standard EAN-13, EAN-8, UPC-A, or Alphanumeric Code 128 (8 to 14 characters)
    return /^[A-Z0-9]{8,18}$/i.test(clean);
  }
}
