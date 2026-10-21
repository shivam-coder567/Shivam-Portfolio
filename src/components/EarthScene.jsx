import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Preload, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const RADIUS = 1;
const TEXTURE_URL = '/textures/earth_atmos_2048.jpg';
useTexture.preload(TEXTURE_URL);
const INITIAL_DISTANCE = 3.35;
const MIN_DISTANCE = 2.35;
const MAX_DISTANCE = 4.5;
const PRAYAGRAJ = { latitude: 25.4358, longitude: 81.8463 };

// SphereGeometry's u=0 meridian is 180°W. This maps east longitude to the
// texture's rightward u direction and north latitude toward +Y.
function earthPoint(latitude, longitude, radius) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon));
}

function SurfaceMarker({ latitude, longitude, color, label, reduceMotion }) {
  const point = useMemo(() => earthPoint(latitude, longitude, 1.013), [latitude, longitude]);
  const orientation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), point.clone().normalize()), [point]);
  const facingRef = useRef();
  const labelAnchorRef = useRef();
  const markerWorld = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const toCamera = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (!facingRef.current) return;
    markerWorld.setFromMatrixPosition(facingRef.current.matrixWorld);
    normal.copy(markerWorld).normalize();
    toCamera.copy(camera.position).sub(markerWorld).normalize();
    const opacity = THREE.MathUtils.smoothstep(normal.dot(toCamera), -0.1, 0.18);
    const labelElement = facingRef.current.userData.labelElement;
    if (labelElement) labelElement.style.opacity = String(opacity);
    if (labelAnchorRef.current) {
      projected.copy(markerWorld).project(camera);
      labelAnchorRef.current.position.x = projected.x > 0.08 ? -0.055 : 0.055;
    }
  });
  return <group position={point} quaternion={orientation} ref={facingRef}>
    <mesh><sphereGeometry args={[0.014, 12, 12]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
    <>
      <mesh><torusGeometry args={[0.021, 0.002, 8, 32]} /><meshBasicMaterial color="#f8fbff" transparent opacity={0.9} depthWrite={false} /></mesh>
      <PulseRing color={color} reduceMotion={reduceMotion} />
      <group ref={labelAnchorRef} position={[0.055, 0.045, 0.006]}>
        <Html center className="prayagraj-label" style={{ pointerEvents: 'none' }}>
          <span ref={(node) => { if (facingRef.current) facingRef.current.userData.labelElement = node; }} className="prayagraj-name">{label}</span>
        </Html>
      </group>
    </>
  </group>;
}

function PulseRing({ color, reduceMotion }) {
  const ring = useRef();
  const material = useRef();
  useFrame(({ clock }) => {
    if (!ring.current || !material.current) return;
    if (reduceMotion) return;
    const wave = reduceMotion ? 0 : (Math.sin(clock.elapsedTime * Math.PI * 2 / 2.5) + 1) / 2;
    ring.current.scale.setScalar(1 + wave * 0.28);
    material.current.opacity = 0.36 - wave * 0.2;
  });
  return <mesh ref={ring}>
    <ringGeometry args={[0.023, 0.028, 36]} />
    <meshBasicMaterial ref={material} color={color} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>;
}

function Earth({ groupRef, reduceMotion, isMobile }) {
  const texture = useTexture(TEXTURE_URL);
  const gl = useThree((state) => state.gl);
  const initialRotation = useMemo(() => {
    const latitude = THREE.MathUtils.degToRad(PRAYAGRAJ.latitude);
    const longitude = THREE.MathUtils.degToRad(PRAYAGRAJ.longitude);
    const north = new THREE.Vector3(-Math.sin(latitude) * Math.cos(longitude), Math.cos(latitude), Math.sin(latitude) * Math.sin(longitude));
    const normal = earthPoint(PRAYAGRAJ.latitude, PRAYAGRAJ.longitude, 1).normalize();
    const align = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
    north.applyQuaternion(align);
    const keepNorthUp = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.atan2(north.x, north.y));
    return keepNorthUp.multiply(align);
  }, []);
  const segments = isMobile ? 48 : 64;
  useEffect(() => {
    if (texture.colorSpace !== THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);
    texture.needsUpdate = true;
    // useTexture shares a cached texture; don't dispose or clear it on unmount.
  }, [gl, texture]);
  return <group ref={groupRef} quaternion={initialRotation}>
    <mesh>
      <sphereGeometry args={[RADIUS, segments, segments]} />
      <meshStandardMaterial map={texture} roughness={0.9} metalness={0.01} />
    </mesh>
    <mesh scale={1.035}>
      <sphereGeometry args={[RADIUS, isMobile ? 32 : 48, isMobile ? 32 : 48]} />
      <shaderMaterial transparent depthWrite={false} side={THREE.FrontSide} blending={THREE.AdditiveBlending}
        uniforms={{ glowColor: { value: new THREE.Color('#388cff') }, glowStrength: { value: 0.22 } }}
        vertexShader="varying vec3 vNormal; varying vec3 vView; void main(){ vec4 mvPosition=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-mvPosition.xyz); gl_Position=projectionMatrix*mvPosition; }"
        fragmentShader="uniform vec3 glowColor; uniform float glowStrength; varying vec3 vNormal; varying vec3 vView; void main(){ float rim=1.0-max(dot(normalize(vNormal),normalize(vView)),0.0); float softRim=smoothstep(0.0,0.9,pow(rim,2.6)); gl_FragColor=vec4(glowColor,softRim*glowStrength); }" />
    </mesh>
    <SurfaceMarker {...PRAYAGRAJ} color="#ff5364" label="Prayagraj" reduceMotion={reduceMotion} />
    <mesh rotation={[Math.PI / 2.8, 0.15, 0]}><torusGeometry args={[1.16, 0.002, 8, 128]} /><meshBasicMaterial color="#45d8ff" transparent opacity={0.22} depthWrite={false} /></mesh>
    <mesh rotation={[1.18, 0.45, 0.45]}><torusGeometry args={[1.23, 0.0015, 8, 128]} /><meshBasicMaterial color="#9c79ff" transparent opacity={0.16} depthWrite={false} /></mesh>
  </group>;
}

function RendererLifecycle({ onContextLost, onContextRestored }) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event) => { event.preventDefault(); onContextLost(); };
    const restored = () => { onContextRestored(); invalidate(); };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
    };
  }, [gl, invalidate, onContextLost, onContextRestored]);
  return null;
}

function InteractionController({ groupRef, interactionRef, reduceMotion, active }) {
  const { invalidate } = useThree();
  const axisY = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const axisX = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const yaw = useMemo(() => new THREE.Quaternion(), []);
  const pitch = useMemo(() => new THREE.Quaternion(), []);
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const group = groupRef.current;
    if (!group || !active) return;
    const interaction = interactionRef.current;
    if (interaction.dragging || interaction.pointers.size > 1) return;
    if (reduceMotion) { interaction.velocityX = 0; interaction.velocityY = 0; return; }
    const yawSpeed = interaction.velocityX + (performance.now() - interaction.lastAction > 3000 ? 0.035 : 0);
    yaw.setFromAxisAngle(axisY, yawSpeed * delta);
    pitch.setFromAxisAngle(axisX, interaction.velocityY * delta);
    group.quaternion.premultiply(yaw).premultiply(pitch);
    const decay = Math.exp(-4.6 * delta);
    interaction.velocityX *= decay;
    interaction.velocityY *= decay;
    if (Math.abs(interaction.velocityX) < 0.002) interaction.velocityX = 0;
    if (Math.abs(interaction.velocityY) < 0.002) interaction.velocityY = 0;
    invalidate();
  });
  return null;
}

function Fallback() { return <mesh><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color="#193e79" roughness={0.8} /></mesh>; }
function Reveal({ onReady }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}
class TextureBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure?.(); }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}

export default function EarthScene({ reduceMotion }) {
  const container = useRef();
  const groupRef = useRef();
  const cameraRef = useRef(null);
  const interactionRef = useRef({ pointers: new Map(), dragging: false, lastAction: performance.now(), velocityX: 0, velocityY: 0, pinchDistance: 0 });
  const reduceMotionRef = useRef(reduceMotion);
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  reduceMotionRef.current = reduceMotion;
  const onReady = useMemo(() => () => { interactionRef.current.lastAction = performance.now(); setReady(true); }, []);
  const onFailure = useMemo(() => () => setReady(true), []);
  const onContextLost = useMemo(() => () => setContextLost(true), []);
  const onContextRestored = useMemo(() => () => setContextLost(false), []);

  useEffect(() => {
    const element = container.current;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && !document.hidden), { threshold: 0.01 });
    observer.observe(element);
    const updateVisibility = () => setActive(!document.hidden && element.getBoundingClientRect().bottom > 0 && element.getBoundingClientRect().top < window.innerHeight);
    const updateSize = () => setIsMobile(window.matchMedia('(max-width: 900px)').matches);
    document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('resize', updateSize);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', updateVisibility); window.removeEventListener('resize', updateSize); };
  }, []);

  useEffect(() => {
    const element = container.current;
    const interaction = interactionRef.current;
    const points = interaction.pointers;
    const setAction = () => { interaction.lastAction = performance.now(); };
    const currentPinchDistance = () => {
      const [first, second] = [...points.values()];
      return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
    };
    const onPointerDown = (event) => {
      if ((event.pointerType === 'mouse' && event.button !== 0) || event.target.closest('button')) return;
      points.set(event.pointerId, { x: event.clientX, y: event.clientY, previousX: event.clientX, previousY: event.clientY, previousTime: performance.now() });
      try { element.setPointerCapture(event.pointerId); } catch { /* Pointer can be cancelled before capture. */ }
      interaction.dragging = points.size === 1;
      interaction.velocityX = 0; interaction.velocityY = 0;
      interaction.pinchDistance = points.size > 1 ? currentPinchDistance() : 0;
      element.classList.toggle('is-dragging', interaction.dragging);
      setAction();
    };
    const onPointerMove = (event) => {
      const point = points.get(event.pointerId);
      if (!point) return;
      const now = performance.now();
      const deltaX = event.clientX - point.previousX;
      const deltaY = event.clientY - point.previousY;
      point.x = event.clientX;
      point.y = event.clientY;
      if (points.size > 1) {
        const distance = currentPinchDistance();
        const camera = cameraRef.current;
        if (camera && interaction.pinchDistance > 0 && distance > 0) camera.position.setLength(THREE.MathUtils.clamp(camera.position.length() * interaction.pinchDistance / distance, MIN_DISTANCE, MAX_DISTANCE));
        interaction.pinchDistance = distance;
      } else if (interaction.dragging && groupRef.current) {
        const elapsed = Math.max((now - point.previousTime) / 1000, 0.008);
        const dx = deltaX * 0.005; const dy = deltaY * 0.005;
        groupRef.current.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx));
        groupRef.current.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy));
        if (!reduceMotionRef.current) { interaction.velocityX = THREE.MathUtils.clamp(dx / elapsed, -2.4, 2.4); interaction.velocityY = THREE.MathUtils.clamp(dy / elapsed, -2.4, 2.4); }
      }
      point.previousX = event.clientX; point.previousY = event.clientY; point.previousTime = now;
      setAction();
    };
    const endPointer = (event) => {
      points.delete(event.pointerId);
      if (points.size === 1) { const point = points.values().next().value; point.previousX = point.x; point.previousY = point.y; point.previousTime = performance.now(); }
      interaction.dragging = points.size === 1;
      interaction.pinchDistance = points.size > 1 ? currentPinchDistance() : 0;
      element.classList.toggle('is-dragging', interaction.dragging);
      setAction();
    };
    const onWheel = (event) => {
      if (!event.ctrlKey || !cameraRef.current) return;
      event.preventDefault();
      const camera = cameraRef.current;
      const factor = Math.exp(THREE.MathUtils.clamp(event.deltaY * 0.001, -0.3, 0.3));
      camera.position.setLength(THREE.MathUtils.clamp(camera.position.length() * factor, MIN_DISTANCE, MAX_DISTANCE));
      setAction();
    };
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', endPointer);
    element.addEventListener('pointercancel', endPointer);
    element.addEventListener('lostpointercapture', endPointer);
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => { element.removeEventListener('pointerdown', onPointerDown); element.removeEventListener('pointermove', onPointerMove); element.removeEventListener('pointerup', endPointer); element.removeEventListener('pointercancel', endPointer); element.removeEventListener('lostpointercapture', endPointer); element.removeEventListener('wheel', onWheel); points.clear(); };
  }, []);

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  return <div className={`earth-canvas ${ready ? 'is-ready' : ''} ${contextLost ? 'is-context-lost' : ''}`} ref={container}>
    {!ready && <div className="earth-loading-indicator" role="status" aria-label="Loading Earth"><span /></div>}
    <Canvas aria-label="Interactive globe showing Prayagraj, India" role="img" frameloop={active && !contextLost ? 'always' : 'never'} dpr={dpr} resize={{ debounce: 0, scroll: false }} camera={{ position: [0, 0, INITIAL_DISTANCE], fov: 38 }} gl={{ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' }} onCreated={({ camera }) => { cameraRef.current = camera; }}>
      <ambientLight intensity={1.15} /><directionalLight position={[-3, 2, 4]} intensity={3.4} color="#d5eaff" />
      <Stars radius={60} depth={40} count={isMobile ? 500 : 1100} factor={2.2} saturation={0.35} fade speed={reduceMotion ? 0 : 0.25} />
      <RendererLifecycle onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <InteractionController groupRef={groupRef} interactionRef={interactionRef} reduceMotion={reduceMotion} active={active && !contextLost} />
      <TextureBoundary onFailure={onFailure}><Suspense fallback={null}><Earth groupRef={groupRef} reduceMotion={reduceMotion} isMobile={isMobile} /><Preload all /><Reveal onReady={onReady} /></Suspense></TextureBoundary>
    </Canvas>
  </div>;
}
