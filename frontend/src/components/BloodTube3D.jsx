import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BloodTube3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // Clear any previous canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Inside-blood glow point light
    const bloodLight = new THREE.PointLight(0xff0000, 2.5, 5);
    bloodLight.position.set(0, -0.5, 0);
    scene.add(bloodLight);

    // 3. Dynamic Canvas Texture for Clinical Label
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 256;
    const ctx = labelCanvas.getContext('2d');
    
    // Fill label background (clean off-white paper texture)
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, 512, 256);
    
    // Left decorative lab theme bar
    ctx.fillStyle = '#085041';
    ctx.fillRect(0, 0, 24, 256);
    ctx.fillStyle = '#128362';
    ctx.fillRect(24, 0, 8, 256);
    
    // Grid Lines on Label
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    for (let y = 30; y < 250; y += 30) {
      ctx.beginPath();
      ctx.moveTo(48, y);
      ctx.lineTo(320, y);
      ctx.stroke();
    }

    // Label Clinical Text
    ctx.fillStyle = '#085041';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('SANA PATHOLOGY', 48, 55);
    
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('VACUUM BLOOD TUBE', 48, 80);
    
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Patient: __________________', 48, 125);
    ctx.fillText('Date: 2026-06-11', 48, 165);
    ctx.fillText('Test: Complete Blood Count', 48, 205);

    // Draw realistic barcode
    ctx.fillStyle = '#000000';
    const barcodeStartX = 345;
    const barcodeWidth = 130;
    ctx.fillRect(barcodeStartX, 50, 4, 110);
    ctx.fillRect(barcodeStartX + 8, 50, 2, 110);
    ctx.fillRect(barcodeStartX + 14, 50, 6, 110);
    ctx.fillRect(barcodeStartX + 24, 50, 4, 110);
    ctx.fillRect(barcodeStartX + 30, 50, 2, 110);
    ctx.fillRect(barcodeStartX + 36, 50, 8, 110);
    ctx.fillRect(barcodeStartX + 48, 50, 2, 110);
    ctx.fillRect(barcodeStartX + 54, 50, 6, 110);
    ctx.fillRect(barcodeStartX + 64, 50, 4, 110);
    ctx.fillRect(barcodeStartX + 72, 50, 8, 110);
    ctx.fillRect(barcodeStartX + 84, 50, 2, 110);
    ctx.fillRect(barcodeStartX + 90, 50, 6, 110);
    ctx.fillRect(barcodeStartX + 100, 50, 4, 110);
    ctx.fillRect(barcodeStartX + 108, 50, 8, 110);
    ctx.fillRect(barcodeStartX + 120, 50, 4, 110);

    ctx.fillStyle = '#555555';
    ctx.font = '11px monospace';
    ctx.fillText('SANA*89201*CBC', barcodeStartX + 15, 178);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);

    // 4. Create geometries and materials
    const tubeGroup = new THREE.Group();
    scene.add(tubeGroup);

    // Materials
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      transmission: 0.95,
      roughness: 0.05,
      metalness: 0.05,
      ior: 1.52, // Glass refraction index
      thickness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide
    });

    const bloodMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x800000,
      emissive: 0x300000,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.2, // blood absorbs light but scatters slightly
      thickness: 0.1
    });

    // EDTA purple top cap (lavender color standard for EDTA tubes)
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xa569bd, // Royal lavender/purple
      roughness: 0.45,
      metalness: 0.15
    });

    const labelMaterial = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.8,
      side: THREE.DoubleSide
    });

    // Glass cylinder body (height: 4.2, radius: 0.8)
    const glassBodyGeom = new THREE.CylinderGeometry(0.8, 0.8, 4.2, 32, 1, true);
    const glassBody = new THREE.Mesh(glassBodyGeom, glassMaterial);
    glassBody.position.y = 0.5;
    tubeGroup.add(glassBody);

    // Glass rounded hemispherical bottom
    const glassBottomGeom = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const glassBottom = new THREE.Mesh(glassBottomGeom, glassMaterial);
    glassBottom.position.y = -1.6;
    glassBottom.rotation.x = Math.PI; // flip downward
    tubeGroup.add(glassBottom);

    // Blood liquid cylinder body (fills ~60% of the body)
    const bloodHeight = 2.4;
    const bloodRadius = 0.76;
    const bloodBodyGeom = new THREE.CylinderGeometry(bloodRadius, bloodRadius, bloodHeight, 32);
    const bloodBody = new THREE.Mesh(bloodBodyGeom, bloodMaterial);
    // Position blood cylinder to start right at the bottom curve
    bloodBody.position.y = -1.6 + (bloodHeight / 2) + 0.02;
    tubeGroup.add(bloodBody);

    // Blood bottom matching rounded cup of tube
    const bloodBottomGeom = new THREE.SphereGeometry(bloodRadius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bloodBottom = new THREE.Mesh(bloodBottomGeom, bloodMaterial);
    bloodBottom.position.y = -1.6 + 0.02;
    bloodBottom.rotation.x = Math.PI;
    tubeGroup.add(bloodBottom);

    // Clinical label wrapper (rotated 270 degrees so back is open to view blood)
    const labelHeight = 2.4;
    const labelRadius = 0.81;
    const labelGeom = new THREE.CylinderGeometry(labelRadius, labelRadius, labelHeight, 32, 1, true, 0, Math.PI * 1.5);
    const label = new THREE.Mesh(labelGeom, labelMaterial);
    label.position.y = 0.2;
    label.rotation.y = -Math.PI / 1.35; // Position label towards viewer
    tubeGroup.add(label);

    // Purple Rubber Stopper (Cap)
    const capHeight = 0.8;
    const capRadius = 0.85;
    const capBodyGeom = new THREE.CylinderGeometry(capRadius, capRadius, capHeight, 32);
    const capBody = new THREE.Mesh(capBodyGeom, capMaterial);
    capBody.position.y = 2.6 + (capHeight / 2);
    tubeGroup.add(capBody);

    // Cap Dome Top
    const capTopGeom = new THREE.SphereGeometry(capRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const capTop = new THREE.Mesh(capTopGeom, capMaterial);
    capTop.position.y = 2.6 + capHeight;
    tubeGroup.add(capTop);

    // Cap vertical ridges (grip)
    const numRidges = 24;
    const ridgeRadius = 0.035;
    const ridgeHeight = capHeight;
    const ridgeGeom = new THREE.CylinderGeometry(ridgeRadius, ridgeRadius, ridgeHeight, 8);
    for (let i = 0; i < numRidges; i++) {
      const angle = (i / numRidges) * Math.PI * 2;
      const x = Math.cos(angle) * (capRadius - 0.01);
      const z = Math.sin(angle) * (capRadius - 0.01);
      const ridge = new THREE.Mesh(ridgeGeom, capMaterial);
      ridge.position.set(x, 2.6 + (capHeight / 2), z);
      tubeGroup.add(ridge);
    }

    // Inside Blood Bubbles (subtle floating animations)
    const bubbles = [];
    const numBubbles = 8;
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      transmission: 0.95,
      roughness: 0.05
    });
    const bubbleGeom = new THREE.SphereGeometry(0.04, 8, 8);
    for (let i = 0; i < numBubbles; i++) {
      const bubble = new THREE.Mesh(bubbleGeom, bubbleMaterial);
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (bloodRadius - 0.12);
      bubble.position.x = Math.cos(angle) * r;
      bubble.position.z = Math.sin(angle) * r;
      bubble.position.y = -1.5 + Math.random() * bloodHeight;
      
      bubble.userData = {
        speed: 0.003 + Math.random() * 0.005,
        startY: -1.5,
        endY: -1.6 + bloodHeight
      };
      
      tubeGroup.add(bubble);
      bubbles.push(bubble);
    }

    // 5. Interactive Event Handlers
    let targetRotationX = 0.1;
    let targetRotationY = -0.5;
    let isHovered = false;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationX = y * 0.4 + 0.1;
      targetRotationY = x * 0.6 - 0.5;
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      targetRotationX = 0.1;
      targetRotationY = -0.5;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 6. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow floating motion
      const floatOffset = Math.sin(elapsedTime * 1.5) * 0.15;
      tubeGroup.position.y = floatOffset;

      // Rotate bubbles
      bubbles.forEach(b => {
        b.position.y += b.userData.speed;
        if (b.position.y > b.userData.endY) {
          b.position.y = b.userData.startY;
        }
      });

      // Smooth rotation transitions (Lerp)
      const lerpFactor = isHovered ? 0.05 : 0.025;
      tubeGroup.rotation.x += (targetRotationX - tubeGroup.rotation.x) * lerpFactor;
      
      // Auto rotate base when not hovered, interact on hover
      if (!isHovered) {
        tubeGroup.rotation.y = elapsedTime * 0.35;
      } else {
        tubeGroup.rotation.y += (targetRotationY - tubeGroup.rotation.y) * lerpFactor;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up on component unmount
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose resources
      glassBodyGeom.dispose();
      glassBottomGeom.dispose();
      bloodBodyGeom.dispose();
      bloodBottomGeom.dispose();
      labelGeom.dispose();
      capBodyGeom.dispose();
      capTopGeom.dispose();
      ridgeGeom.dispose();
      bubbleGeom.dispose();

      glassMaterial.dispose();
      bloodMaterial.dispose();
      capMaterial.dispose();
      labelMaterial.dispose();
      bubbleMaterial.dispose();
      labelTexture.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      style={{ minHeight: '300px' }}
    />
  );
};

export default BloodTube3D;
