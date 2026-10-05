import { Component, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { AuthRoleService } from '../../../services/auth-role.service';
import { TryOnEngineService, CalibrationParams } from '../../../services/try-on-engine.service';
import { Product } from '../../../models/optivision.models';

@Component({
  selector: 'app-try-on',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './try-on.component.html',
  styleUrls: ['./try-on.component.css']
})
export class TryOnComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  products: Product[] = [];
  selectedProduct: Product | null = null;
  comparisonProduct: Product | null = null;
  isComparing: boolean = false;

  isAuthenticated: boolean = false;
  isCameraActive: boolean = false;
  useAvatarMode: boolean = true;
  cameraError: string | null = null;
  private mediaStream: MediaStream | null = null;

  // Calibration Sliders
  calibration: CalibrationParams = {
    scale: 1.0,
    positionX: 0.0,
    positionY: 0.0,
    positionZ: 0.0,
    rotationX: 0.0,
    rotationY: 0.0,
    rotationZ: 0.0
  };

  // Dragging state
  isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;

  // Snapshot Capture
  capturedSnapshotUrl: string | null = null;
  snapshotSuccess: boolean = false;

  avatarModels = [
    { name: 'Modèle Femme 1', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80' },
    { name: 'Modèle Homme 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80' },
    { name: 'Modèle Femme 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80' }
  ];
  selectedAvatar: string = this.avatarModels[0].url;

  constructor(
    private optiService: OptiVisionService,
    private authRoleService: AuthRoleService,
    private tryOnEngine: TryOnEngineService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authRoleService.isLoggedIn();

    this.optiService.getProducts().subscribe(prods => {
      this.products = prods.filter(p => p.tryOn3dAvailable ?? (p as any).virtualTryOnEnabled ?? true);
      if (this.products.length === 0) {
        this.products = prods;
      }
      if (this.products.length > 0) {
        this.selectProduct(this.products[0]);
      }

      // Query param support: /try-on?variantId=XXX or /try-on?productId=XXX
      this.route.queryParams.subscribe(params => {
        if (params['productId'] || params['variantId']) {
          const id = +(params['productId'] || params['variantId']);
          const found = this.products.find(p => p.id === id);
          if (found) this.selectProduct(found);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.tryOnEngine.stopTracking();
  }

  goToLogin(): void {
    this.router.navigate(['/connexion'], { queryParams: { returnUrl: '/try-on' } });
  }

  goToRegister(): void {
    this.router.navigate(['/connexion'], { queryParams: { mode: 'register', returnUrl: '/try-on' } });
  }

  async startCamera(): Promise<void> {
    this.cameraError = null;
    this.useAvatarMode = false;
    this.isCameraActive = true;
    this.cdr.detectChanges();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        this.mediaStream = stream;

        setTimeout(async () => {
          if (this.videoElement && this.videoElement.nativeElement && this.threeCanvas && this.threeCanvas.nativeElement) {
            const video = this.videoElement.nativeElement;
            const canvas = this.threeCanvas.nativeElement;
            video.srcObject = stream;
            
            video.onloadedmetadata = async () => {
              await video.play();
              // Initialize Three.js WebGL & MediaPipe Engine
              await this.tryOnEngine.initialize(canvas, video);
              this.tryOnEngine.startTracking(video);
            };
            this.cdr.detectChanges();
          }
        }, 150);
      } catch (err: any) {
        console.warn('Webcam permission denied or unavailable', err);
        this.cameraError = 'La caméra n’est pas accessible. Le mode mannequin 3D est activé.';
        this.useAvatarMode = true;
        this.isCameraActive = false;
        this.cdr.detectChanges();
      }
    } else {
      this.cameraError = 'Votre navigateur ne supporte pas la caméra.';
      this.useAvatarMode = true;
      this.isCameraActive = false;
      this.cdr.detectChanges();
    }
  }

  stopCamera(): void {
    this.tryOnEngine.stopTracking();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoElement && this.videoElement.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
    this.isCameraActive = false;
    this.cdr.detectChanges();
  }

  selectProduct(prod: Product): void {
    if (this.isComparing) {
      this.comparisonProduct = prod;
    } else {
      this.selectedProduct = prod;
    }

    // Load custom GLB asset or procedural fallback
    if (prod && (prod as any).model3dUrl) {
      this.tryOnEngine.loadGlbModel((prod as any).model3dUrl);
    } else {
      this.tryOnEngine.setProceduralEyewear();
    }
  }

  selectAvatar(url: string): void {
    this.selectedAvatar = url;
    this.useAvatarMode = true;
    this.stopCamera();
  }

  onCalibrationChange(): void {
    this.tryOnEngine.updateCalibration(this.calibration);
  }

  resetPosition(): void {
    this.calibration = {
      scale: 1.0,
      positionX: 0.0,
      positionY: 0.0,
      positionZ: 0.0,
      rotationX: 0.0,
      rotationY: 0.0,
      rotationZ: 0.0
    };
    this.onCalibrationChange();
  }

  // Interactive Dragging
  onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.startY = 'touches' in event ? event.touches[0].clientY : event.clientY;
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;

    this.calibration.positionX += deltaX * 0.1;
    this.calibration.positionY -= deltaY * 0.1;
    this.onCalibrationChange();

    this.startX = clientX;
    this.startY = clientY;
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  captureSnapshot(): void {
    if (this.threeCanvas && this.threeCanvas.nativeElement) {
      this.capturedSnapshotUrl = this.threeCanvas.nativeElement.toDataURL('image/png');
    } else {
      this.capturedSnapshotUrl = this.selectedAvatar;
    }
    this.snapshotSuccess = true;
    setTimeout(() => this.snapshotSuccess = false, 4000);
  }

  toggleComparison(): void {
    this.isComparing = !this.isComparing;
    if (this.isComparing && !this.comparisonProduct && this.products.length > 1) {
      this.comparisonProduct = this.products[1];
    }
  }

  addToCart(product: Product): void {
    this.optiService.addToCart(product);
  }
}
