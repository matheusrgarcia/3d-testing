import { useEffect, useRef } from "react";
import * as THREE from "three";

interface GameProps {
  showGrid: boolean;
}

interface GameState {
  playerPosition: { x: number; y: number; z: number };
  plants: Array<{
    type: "tree" | "bush" | "flower";
    position: { x: number; y: number; z: number };
  }>;
}

const Game = ({ showGrid }: GameProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Basic setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Handle context loss
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      console.log('WebGL context lost');
    }, false);

    renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored');
      animate();
    }, false);

    // Fullscreen setup
    const enterFullscreen = () => {
      if (mountRef.current) {
        if (mountRef.current.requestFullscreen) {
          mountRef.current.requestFullscreen();
        }
      }
    };

    // Enter fullscreen on F11
    window.addEventListener("keydown", (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        enterFullscreen();
      }
    });

    // Character body
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    scene.add(body);

    // Character head
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    body.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.2, 0.1, 0.4);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.2, 0.1, 0.4);
    head.add(rightEye);

    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(200, 200);
    gridHelperRef.current = gridHelper;
    gridHelper.visible = showGrid;
    scene.add(gridHelper);

    // Debug toggle handler
    const handleDebugToggle = (show: boolean) => {
      gridHelper.visible = show;
    };

    // Initial debug state
    handleDebugToggle(showGrid);

    // Plant types
    const createTree = (x: number, z: number) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
      const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 2, z);
      scene.add(trunk);

      const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
      const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x228b22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, 5, z);
      scene.add(leaves);
    };

    const createBush = (x: number, z: number) => {
      const bushGeometry = new THREE.SphereGeometry(1, 8, 8);
      const bushMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(x, 1, z);
      scene.add(bush);
    };

    const createFlower = (x: number, z: number) => {
      const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x228b22 });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.set(x, 0.5, z);
      scene.add(stem);

      const flowerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      flower.position.set(x, 1.3, z);
      scene.add(flower);
    };

    // Load or create game state
    let gameState: GameState;
    const savedState = localStorage.getItem("gameState");

    if (savedState) {
      gameState = JSON.parse(savedState);
      // Restore player position
      body.position.set(
        gameState.playerPosition.x,
        gameState.playerPosition.y,
        gameState.playerPosition.z
      );
      // Restore plants
      gameState.plants.forEach((plant) => {
        if (plant.type === "tree")
          createTree(plant.position.x, plant.position.z);
        else if (plant.type === "bush")
          createBush(plant.position.x, plant.position.z);
        else createFlower(plant.position.x, plant.position.z);
      });
    } else {
      // Create new game state
      gameState = {
        playerPosition: { x: 0, y: 1, z: 0 },
        plants: [],
      };

      // Generate new plants
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 180 - 90;
        const z = Math.random() * 180 - 90;
        const type = Math.random();
        let plantType: "tree" | "bush" | "flower";

        if (type < 0.5) {
          createTree(x, z);
          plantType = "tree";
        } else if (type < 0.8) {
          createBush(x, z);
          plantType = "bush";
        } else {
          createFlower(x, z);
          plantType = "flower";
        }

        gameState.plants.push({
          type: plantType,
          position: { x, y: 0, z },
        });
      }

      // Save initial state
      localStorage.setItem("gameState", JSON.stringify(gameState));
    }

    // Position camera
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    // Zoom controls
    let cameraDistance = 15;
    const handleWheel = (event: WheelEvent) => {
      const zoomSpeed = 0.5;
      const delta = event.deltaY * zoomSpeed;

      // Calculate new camera position while maintaining isometric angle
      const angle = Math.PI / 4; // 45 degrees
      const newDistance = cameraDistance + delta;

      if (newDistance >= 5 && newDistance <= 30) {
        cameraDistance = newDistance;
        camera.position.set(
          cameraDistance * Math.cos(angle),
          cameraDistance * Math.sin(angle),
          cameraDistance * Math.cos(angle)
        );
      }
    };

    window.addEventListener("wheel", handleWheel);

    // Movement controls
    const keys = {
      w: false,
      s: false,
      a: false,
      d: false,
    };

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase() as keyof typeof keys] = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase() as keyof typeof keys] = false;
      }
    });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Character movement
      const speed = 0.05;
      if (keys.w) {
        body.position.x -= speed;
        body.position.z -= speed;
      }
      if (keys.s) {
        body.position.x += speed;
        body.position.z += speed;
      }
      if (keys.a) {
        body.position.x -= speed;
        body.position.z += speed;
      }
      if (keys.d) {
        body.position.x += speed;
        body.position.z -= speed;
      }

      // Save game state every 5 seconds
      if (Math.floor(Date.now() / 5000) % 2 === 0) {
        gameState.playerPosition = {
          x: body.position.x,
          y: body.position.y,
          z: body.position.z,
        };
        localStorage.setItem("gameState", JSON.stringify(gameState));
      }

      // Camera follow with zoom
      const angle = Math.PI / 4;
      camera.position.set(
        body.position.x + cameraDistance * Math.cos(angle),
        body.position.y + cameraDistance * Math.sin(angle),
        body.position.z + cameraDistance * Math.cos(angle)
      );
      camera.lookAt(body.position);

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", () => {});
      window.removeEventListener("keyup", () => {});
      window.removeEventListener("wheel", handleWheel);
      mountRef.current?.removeEventListener("click", enterFullscreen);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Separate effect for grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default Game;
