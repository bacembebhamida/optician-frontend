import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

@Component({
  selector: 'app-glasses-viewer',
  standalone: true,
  imports: [],
  template: `
    <div class="viewer-container">
      <canvas #canvas class="webgl-canvas"></canvas>
      
      <!-- Loading indicator -->
      @if (isLoading) {
        <div class="loader-overlay">
          <div class="spinner"></div>
          <p>Chargement du modèle 3D...</p>
        </div>
      }
      
      <!-- Customizable controls Overlay -->
      <div class="controls-overlay">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .viewer-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 400px;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 12px;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
    }
    .webgl-canvas {
      width: 100%;
      height: 100%;
      display: block;
      outline: none;
    }
    .loader-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(4px);
      z-index: 10;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0,0,0,0.1);
      border-left-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .controls-overlay {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
    }
  `]
})
export class GlassesViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() public modelUrl: string = '';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model: THREE.Group | null = null;
  private animationId: number = 0;

  public isLoading: boolean = false;
  
  ngAfterViewInit(): void {
    this.initThreeJs();
    if (this.modelUrl) {
      this.loadModel(this.modelUrl);
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    window.removeEventListener('resize', this.onWindowResize);
  }

  private initThreeJs(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement as HTMLElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // Scene
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 3.2);

    // Renderer with ACESFilmicToneMapping & PCFSoftShadowMap
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 1. Environment Map (PMREMGenerator + RoomEnvironment for PBR Metal Reflections)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv).texture;
    pmremGenerator.dispose();

    // 2. Lumière ambiante pour déboucher les ombres
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    // 3. Lumière directionnelle principale avant
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // 4. Lumière arrière pour détacher le contour
    const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(-5, -5, -5);
    this.scene.add(backLight);

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.0;
    this.controls.maxDistance = 8.0;
    this.controls.target.set(0, 0, 0);

    // Resize handler
    window.addEventListener('resize', this.onWindowResize);

    // Render loop
    this.animate();
  }

  public detectedShape: string = 'STANDARD';

  public loadModel(url: string): void {
    if (!url) return;
    this.isLoading = true;
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        if (this.model) {
          this.scene.remove(this.model);
        }
        
        this.model = gltf.scene;

        // 1. Rotation pour placer les verres face à l'écran
        this.model.rotation.set(0, 0, 0);

        // 2. Calculer la boîte englobante et recentrer
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        this.model.position.sub(center);

        // 3. Ajustement d'échelle proportionnel
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const targetScale = 2.2 / maxDim;
          this.model.scale.set(targetScale, targetScale, targetScale);
        }

        // 4. Classification automatique de la forme par Ratio (Largeur / Hauteur)
        const ratio = size.y > 0 ? (size.x / size.y) : 1.2;
        this.detectedShape = ratio >= 1.3 ? 'RECTANGLE' : (ratio <= 1.15 ? 'CARRE' : 'OVALE');

        // 5. Appliquer les matériaux réalistes (Monture dorée Persol & Verres vert bouteille)
        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            const name = mesh.name.toLowerCase();
            
            // Verres Persol : translucidité vert bouteille et réfraction optique (ior = 1.52)
            if (name.includes('lens') || name.includes('verre') || name.includes('glass')) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color('#1f3328'),
                transmission: 0.65,
                opacity: 1,
                transparent: true,
                roughness: 0.05,
                ior: 1.52,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
              });
            } else {
              // Monture dorée Persol / Gold Wire
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#d4af37'),
                metalness: 0.95,
                roughness: 0.2
              });
            }
          }
        });
        
        this.scene.add(this.model);
        this.isLoading = false;

        // 6. Caméra face / légèrement 3/4
        if (this.camera && this.controls) {
          this.camera.position.set(0, 0.4, 3.2);
          this.camera.lookAt(0, 0, 0);
          this.controls.target.set(0, 0, 0);
          this.controls.update();
        }
      },
      undefined,
      (error) => {
        console.error('Error loading 3D GLTF model:', error);
        this.isLoading = false;
      }
    );
  }

  public changeFrameColor(colorValue: string | number): void {
    if (!this.model) return;
    const threeColor = new THREE.Color(colorValue);
    
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const meshName = child.name.toLowerCase();
        const isLens = meshName.includes('lens') || meshName.includes('glass');
        if (!isLens) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const updateMat = (mat: THREE.Material) => {
              if ('color' in mat) {
                (mat as THREE.MeshStandardMaterial).color.set(threeColor);
              }
            };
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(updateMat);
            } else {
              updateMat(mesh.material);
            }
          }
        }
      }
    });
  }
  
  public changeLensesColor(colorValue: string | number, opacity: number = 0.65): void {
    if (!this.model) return;
    const threeColor = new THREE.Color(colorValue);
    
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const meshName = child.name.toLowerCase();
        if (meshName.includes('lens') || meshName.includes('glass')) {
          const mesh = child as THREE.Mesh;
          
          const updateMaterial = (mat: THREE.Material) => {
            if ('color' in mat) {
              (mat as THREE.MeshStandardMaterial).color.set(threeColor);
              mat.transparent = true;
              mat.opacity = opacity;
            }
          };

          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(updateMaterial);
            } else {
              updateMaterial(mesh.material);
            }
          }
        }
      }
    });
  }

  public isAutoRotating: boolean = false;

  public toggleAutoRotate(): void {
    this.isAutoRotating = !this.isAutoRotating;
    if (this.controls) {
      this.controls.autoRotate = this.isAutoRotating;
      this.controls.autoRotateSpeed = 2.5;
    }
  }

  public setFrontView(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(0, 0, 3.0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  public setSideView(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(3.0, 0.1, -0.8);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  public setThreeQuarterView(): void {
    if (!this.camera || !this.controls) return;
    this.camera.position.set(1.4, 0.5, 2.6);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private onWindowResize = () => {
    if (!this.camera || !this.renderer || !this.canvasRef) return;
    
    const container = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    if (this.controls) {
      this.controls.update();
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
