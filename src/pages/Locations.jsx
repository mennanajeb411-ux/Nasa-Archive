import { Component, Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Float, Html, useGLTF } from '@react-three/drei'
import { Box3, Group, MathUtils, Vector3 } from 'three'
const base = import.meta.env.BASE_URL

const locations = [
  {
    name: 'Moon',
  model: base + 'models/moon-small.glb',
    position: [-5.5, 0, 0],
    size: 1.7,
    info: 'Apollo-era landers and rovers still rest on the lunar surface.',
  },
  {
    name: 'Mars',
model: base + 'models/mars-small.glb',
    position: [0, 0, 0],
    size: 2.2,
    info: 'Dead rovers and landers wait silently across the red plains.',
  },
  {
    name: 'Deep Space',
model: base + 'models/cassiopeia-small.glb',
    position: [5.8, 0, 0],
    size: 2.0,
    info: 'The glowing remains of a star that exploded over 300 years ago.',
  },
]
/* بيمسك أي خطأ في تحميل نموذج، فالكوكب ده بس يتأثر مش الصفحة كلها */
class ModelBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('Model failed to load:', error.message)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* بيحمّل نموذج GLB وبيظبط حجمه ومكانه تلقائي */
function Model({ url, size }) {
  const { scene } = useGLTF(url)

  const fitted = useMemo(() => {
    const clone = scene.clone(true)
    const box = new Box3().setFromObject(clone)
    const dim = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    clone.position.sub(center)

    const wrapper = new Group()
    wrapper.add(clone)
    wrapper.scale.setScalar((size * 2) / Math.max(dim.x, dim.y, dim.z))
    return wrapper
  }, [scene, size])

  return <primitive object={fitted} />
}

/* كرة سلك مؤقتة أثناء التحميل أو لو الملف ناقص */
function Loader({ size }) {
  return (
    <mesh>
      <sphereGeometry args={[size, 24, 24]} />
      <meshBasicMaterial color="#4f8cff" wireframe />
    </mesh>
  )
}

function Planet({ data, selected, onSelect }) {
  const group = useRef()
  const body = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    body.current.rotation.y += delta * 0.3
    const target = hovered || selected ? 1.2 : 1
    const s = MathUtils.lerp(group.current.scale.x, target, 0.1)
    group.current.scale.setScalar(s)
  })

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={1}>
      <group
        ref={group}
        position={data.position}
        onClick={() => onSelect(data.name)}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <group ref={body}>
          <ModelBoundary fallback={<Loader size={data.size} />}>
            <Suspense fallback={<Loader size={data.size} />}>
              <Model url={data.model} size={data.size} />
            </Suspense>
          </ModelBoundary>
        </group>

     <Html position={[0, -data.size - 0.7, 0]} center distanceFactor={10}>
          <div className={`planet-label ${selected ? 'active' : ''}`}>
            {data.name}
          </div>
        </Html>
      </group>
    </Float>
  )
}

function Locations() {
  const [selected, setSelected] = useState('Mars')
  const current = locations.find((l) => l.name === selected)

  return (
    <section className="locations-fullscreen">
      <div className="scene-full">
      <Canvas camera={{ position: [0, 1.5, 12], fov: 50 }} dpr={[1, 1.5]}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={2.5} />
          <pointLight position={[-8, -3, -5]} intensity={40} color="#4f8cff" />

          <Stars radius={80} depth={50} count={1500} factor={4} fade speed={1.5} />

          {locations.map((l) => (
            <Planet
              key={l.name}
              data={l}
              selected={selected === l.name}
              onSelect={setSelected}
            />
          ))}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.7}
          />
        </Canvas>
      </div>

      <div className="overlay-top">
        <p className="subtitle">YOUR JOURNEY STARTS HERE</p>
        <h2>Choose Your Destination</h2>
      </div>

      <div className="overlay-bottom planet-info">
        <h3>{current.name}</h3>
        <p>{current.info}</p>
      </div>
    </section>
  )
}

export default Locations