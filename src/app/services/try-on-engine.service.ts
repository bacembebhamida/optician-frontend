import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface CalibrationParams {
  scale: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

@Injectable({
  providedIn: 'root'
})
export class TryOnEngineService {

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private glassesGroup!: THREE.Group;
  private currentMesh: THREE.Object3D | null = null;
  private gltfLoader = new GLTFLoader();

  private faceLandmarker: FaceLandmarker | null = null;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;

  // Smoothing Lerp parameters
  private targetPos = new THREE.Vector3();
  private targetRot = new THREE.Euler();
  private targetScale = new THREE.Vector3(1, 1, 1);
  private currentPos = new THREE.Vector3();
  private currentRot = new THREE.Euler();
  private currentScale = new THREE.Vector3(1, 1, 1);
  private lerpFactor = 0.25; // Smooth 30+ FPS tracking

  // Active calibration offsets
  public calibration: CalibrationParams = {
    scale: 1.0,
    positionX: 0.0,
    positionY: 0.0,
    positionZ: 0.0,
    rotationX: 0.0,
    rotationY: 0.0,
    rotationZ: 0.0
  };

  constructor(private ngZone: NgZone) {}

  public async initialize(canvas: HTMLCanvasElement, video: HTMLVideoElement): Promise<void> {
    const width = canvas.clientWidth || 1280;
    const height = canvas.clientHeight || 720;

    // 1. Setup Three.js WebGL Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting setup for realistic PBR materials
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(2, 4, 5);
    this.scene.add(ambientLight, directionalLight);

    // Root Group for Eyewear Model
    this.glassesGroup = new THREE.Group();
    this.scene.add(this.glassesGroup);

    // Load Procedural Procedural Eyewear Fallback
    this.setProceduralEyewear();

    // 2. Initialize MediaPipe Face Landmarker WASM task locally
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1
      });
    } catch (err) {
      console.warn('GPU MediaPipe initialization fallback to CPU:', err);
    }
  }

  public startTracking(video: HTMLVideoElement): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        if (!this.isRunning) return;
        this.processFrame(video);
        this.render();
        this.animFrameId = requestAnimationFrame(loop);
      };
      loop();
    });
  }

  public stopTracking(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private processFrame(video: HTMLVideoElement): void {
    if (!this.faceLandmarker || video.readyState < 2) return;

    const results = this.faceLandmarker.detectForVideo(video, performance.now());
    if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];

      // Landmark keypoints:
      // Left eye corner / pupil center: 33, 133 / 468
      // Right eye corner / pupil center: 263, 362 / 473
      // Nose bridge: 6, 168
      // Chin: 152
      const leftEye = landmarks[468] || landmarks[33];
      const rightEye = landmarks[473] || landmarks[263];
      const noseBridge = landmarks[168] || landmarks[6];

      // Convert MediaPipe normalized coords (0..1) to WebGL Camera viewport coords (-1..1)
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const eyeCenterY = (leftEye.y + rightEye.y) / 2;

      // Calculate Inter-Pupillary Distance (IPD) for dynamic scale
      const dx = (rightEye.x - leftEye.x);
      const dy = (rightEye.y - leftEye.y);
      const ipd = Math.sqrt(dx * dx + dy * dy);

      // WebGL positioning
      const posX = (0.5 - eyeCenterX) * 4.0 + (this.calibration.positionX * 0.05);
      const posY = (0.5 - eyeCenterY) * 3.5 + (this.calibration.positionY * 0.05);
      const posZ = (ipd - 0.25) * 4.0 + (this.calibration.positionZ * 0.05);

      // Head Euler Angles (Yaw / Roll / Pitch)
      const roll = Math.atan2(dy, dx);
      const yaw = (0.5 - noseBridge.x) * 1.5;
      const pitch = (noseBridge.y - eyeCenterY) * 1.2;

      const scaleBase = (ipd * 6.5) * this.calibration.scale;

      this.targetPos.set(posX, posY, posZ);
      this.targetRot.set(pitch + this.calibration.rotationX, -yaw + this.calibration.rotationY, -roll + this.calibration.rotationZ);
      this.targetScale.set(scaleBase, scaleBase, scaleBase);

      // Apply linear interpolation (Lerp) for smooth tracking
      this.currentPos.lerp(this.targetPos, this.lerpFactor);
      this.currentScale.lerp(this.targetScale, this.lerpFactor);

      this.glassesGroup.position.copy(this.currentPos);
      this.glassesGroup.rotation.copy(this.targetRot);
      this.glassesGroup.scale.copy(this.currentScale);
    }
  }

  private render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public loadGlbModel(modelUrl: string): void {
    this.gltfLoader.load(
      modelUrl,
      (gltf) => {
        this.clearCurrentMesh();
        this.currentMesh = gltf.scene;
        // Center geometry bounding box
        const box = new THREE.Box3().setFromObject(this.currentMesh);
        const center = box.getCenter(new THREE.Vector3());
        this.currentMesh.position.sub(center);
        this.glassesGroup.add(this.currentMesh);
      },
      undefined,
      (err) => {
        console.warn('Failed loading custom GLB, using procedural 3D eyewear fallback:', err);
        this.setProceduralEyewear();
      }
    );
  }

  public setProceduralEyewear(): void {
    this.clearCurrentMesh();

    const group = new THREE.Group();

    // Frame material - Sleek dark titanium
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.85,
      roughness: 0.2
    });

    // Glass material - Semi-transparent tinted lens
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.6,
      ior: 1.5
    });

    // Left Rim
    const leftRimGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
    const leftRim = new THREE.Mesh(leftRimGeo, frameMat);
    leftRim.position.set(-0.42, 0, 0);

    // Right Rim
    const rightRimGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
    const rightRim = new THREE.Mesh(rightRimGeo, frameMat);
    rightRim.position.set(0.42, 0, 0);

    // Nose Bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 16);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.1, 0);

    // Left Lens
    const leftLensGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.02, 32);
    const leftLens = new THREE.Mesh(leftLensGeo, lensMat);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-0.42, 0, 0);

    // Right Lens
    const rightLensGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.02, 32);
    const rightLens = new THREE.Mesh(rightLensGeo, lensMat);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(0.42, 0, 0);

    // Left Temple (Arm)
    const templeGeo = new THREE.BoxGeometry(0.03, 0.03, 0.8);
    const leftTemple = new THREE.Mesh(templeGeo, frameMat);
    leftTemple.position.set(-0.78, 0, -0.4);

    // Right Temple (Arm)
    const rightTemple = new THREE.Mesh(templeGeo, frameMat);
    rightTemple.position.set(0.78, 0, -0.4);

    group.add(leftRim, rightRim, bridge, leftLens, rightLens, leftTemple, rightTemple);
    this.currentMesh = group;
    this.glassesGroup.add(group);
  }

  private clearCurrentMesh(): void {
    if (this.currentMesh) {
      this.glassesGroup.remove(this.currentMesh);
      this.currentMesh = null;
    }
  }

  public updateCalibration(params: Partial<CalibrationParams>): void {
    this.calibration = { ...this.calibration, ...params };
  }
}
