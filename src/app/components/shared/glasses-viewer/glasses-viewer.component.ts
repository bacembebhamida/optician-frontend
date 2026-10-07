import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

    // Studio Lighting setup
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.7);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    fillLight.position.set(-5, 2, 4);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.6);
    rimLight.position.set(0, -4, -6);
    this.scene.add(rimLight);

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
        
        // 1. Calculate raw bounding box
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        
        // 2. Normalize scale based on frame width (size.x) so glasses width is 2.2 units
        const widthDim = size.x > 0 ? size.x : Math.max(size.y, size.z);
        if (widthDim > 0) {
          const desiredScale = 2.2 / widthDim;
          this.model.scale.set(desiredScale, desiredScale, desiredScale);
        }

        // 3. Re-center model at (0, 0, 0) based on front frame (max Z is front of frame)
        const scaledBox = new THREE.Box3().setFromObject(this.model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        // Align X and Y to center, but place front of frame at Z = 0
        this.model.position.set(-scaledCenter.x, -scaledCenter.y, -scaledBox.max.z + 0.1);

        // Set camera angle to a elegant studio 3/4 view facing the front frame
        if (this.camera && this.controls) {
          this.camera.position.set(1.4, 0.5, 2.6);
          this.controls.target.set(0, 0, 0);
          this.controls.update();
        }

        // 4. Enhance PBR Materials & Shadows
        this.model.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            const name = mesh.name.toLowerCase();
            // Enhance lens material transmission if identified as glass/lens
            if (name.includes('lens') || name.includes('glass')) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x15803d),
                transparent: true,
                opacity: 0.65,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.85,
                ior: 1.5,
                clearcoat: 1.0
              });
            }
          }
        });
        
        this.scene.add(this.model);
        this.isLoading = false;

        // Reset camera & OrbitControls target
        this.camera.position.set(0, 0.2, 3.2);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
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
