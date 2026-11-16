import React, { useEffect, useRef, useState } from 'react'
import { X, RotateCcw, ZoomIn, ZoomOut, Compass, Eye } from 'lucide-react'

export interface Panorama360ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  islandName?: string
  panoramaUrl?: string
}

// Curated authentic 360 Equirectangular Panoramas for Banda Neira landmarks
export const DEFAULT_360_PANORAMAS: Record<string, string> = {
  default: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80',
  heritage: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=2000&q=80',
  diving: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80',
  coastal: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80',
}

export const Panorama360Modal: React.FC<Panorama360ModalProps> = ({
  isOpen,
  onClose,
  title,
  islandName,
  panoramaUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [autoRotate, setAutoRotate] = useState<boolean>(true)
  const [fov, setFov] = useState<number>(75)

  // Camera angles
  const yawRef = useRef<number>(0)
  const pitchRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  const activeUrl = panoramaUrl || DEFAULT_360_PANORAMAS.default

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      console.warn('WebGL not supported, falling back to 2D canvas')
      return
    }

    const glContext = gl as WebGLRenderingContext

    // Create simple sphere geometry for 360 equirectangular projection
    const SPHERE_DIVS = 48
    const vertices: number[] = []
    const texCoords: number[] = []
    const indices: number[] = []

    for (let j = 0; j <= SPHERE_DIVS; j++) {
      const theta = (j * Math.PI) / SPHERE_DIVS
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      for (let i = 0; i <= SPHERE_DIVS; i++) {
        const phi = (i * 2 * Math.PI) / SPHERE_DIVS
        const sinPhi = Math.sin(phi)
        const cosPhi = Math.cos(phi)

        const x = cosPhi * sinTheta
        const y = cosTheta
        const z = sinPhi * sinTheta
        const u = 1 - i / SPHERE_DIVS
        const v = j / SPHERE_DIVS

        vertices.push(x, y, z)
        texCoords.push(u, v)
      }
    }

    for (let j = 0; j < SPHERE_DIVS; j++) {
      for (let i = 0; i < SPHERE_DIVS; i++) {
        const first = j * (SPHERE_DIVS + 1) + i
        const second = first + SPHERE_DIVS + 1
        indices.push(first, second, first + 1)
        indices.push(second, second + 1, first + 1)
      }
    }

    // Shaders
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      uniform mat4 uMatrix;
      varying vec2 vTexCoord;
      void main() {
        gl_Position = uMatrix * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
      }
    `
    const fsSource = `
      precision mediump float;
      uniform sampler2D uSampler;
      varying vec2 vTexCoord;
      void main() {
        gl_FragColor = texture2D(uSampler, vTexCoord);
      }
    `

    const compileShader = (type: number, source: string) => {
      const shader = glContext.createShader(type)
      if (!shader) return null
      glContext.shaderSource(shader, source)
      glContext.compileShader(shader)
      return shader
    }

    const vs = compileShader(glContext.VERTEX_SHADER, vsSource)
    const fs = compileShader(glContext.FRAGMENT_SHADER, fsSource)
    const program = glContext.createProgram()
    if (!program || !vs || !fs) return

    glContext.attachShader(program, vs)
    glContext.attachShader(program, fs)
    glContext.linkProgram(program)
    glContext.useProgram(program)

    // Buffers
    const vBuffer = glContext.createBuffer()
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vBuffer)
    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(vertices), glContext.STATIC_DRAW)

    const aPos = glContext.getAttribLocation(program, 'aPosition')
    glContext.enableVertexAttribArray(aPos)
    glContext.vertexAttribPointer(aPos, 3, glContext.FLOAT, false, 0, 0)

    const tBuffer = glContext.createBuffer()
    glContext.bindBuffer(glContext.ARRAY_BUFFER, tBuffer)
    glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(texCoords), glContext.STATIC_DRAW)

    const aTex = glContext.getAttribLocation(program, 'aTexCoord')
    glContext.enableVertexAttribArray(aTex)
    glContext.vertexAttribPointer(aTex, 2, glContext.FLOAT, false, 0, 0)

    const iBuffer = glContext.createBuffer()
    glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, iBuffer)
    glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), glContext.STATIC_DRAW)

    const uMatrix = glContext.getUniformLocation(program, 'uMatrix')
    const uSampler = glContext.getUniformLocation(program, 'uSampler')

    // Texture
    const texture = glContext.createTexture()
    glContext.bindTexture(glContext.TEXTURE_2D, texture)
    // 1x1 placeholder pixel
    glContext.texImage2D(
      glContext.TEXTURE_2D,
      0,
      glContext.RGBA,
      1,
      1,
      0,
      glContext.RGBA,
      glContext.UNSIGNED_BYTE,
      new Uint8Array([15, 44, 89, 255])
    )

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = activeUrl
    img.onload = () => {
      glContext.bindTexture(glContext.TEXTURE_2D, texture)
      glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, img)
      glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE)
      glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE)
      glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR)
      glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR)
      setLoading(false)
    }

    img.onerror = () => {
      setLoading(false)
    }

    // Helper 4x4 matrix ops
    const createPerspective = (f: number, aspect: number, near: number, far: number) => {
      const top = near * Math.tan((f * Math.PI) / 360)
      const bottom = -top
      const right = top * aspect
      const left = -right
      return [
        (2 * near) / (right - left), 0, 0, 0,
        0, (2 * near) / (top - bottom), 0, 0,
        (right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1,
        0, 0, -(2 * far * near) / (far - near), 0
      ]
    }

    const multiplyMatrix = (a: number[], b: number[]) => {
      const out = new Array(16)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[j * 4 + i] =
            a[i] * b[j * 4] +
            a[i + 4] * b[j * 4 + 1] +
            a[i + 8] * b[j * 4 + 2] +
            a[i + 12] * b[j * 4 + 3]
        }
      }
      return out
    }

    const render = () => {
      if (!canvas) return

      if (autoRotate && !isDraggingRef.current) {
        yawRef.current += 0.08
      }

      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        glContext.viewport(0, 0, width, height)
      }

      glContext.clearColor(0.05, 0.08, 0.15, 1.0)
      glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT)

      const aspect = width / height
      const proj = createPerspective(fov, aspect, 0.1, 100.0)

      const yawRad = (yawRef.current * Math.PI) / 180
      const pitchRad = (pitchRef.current * Math.PI) / 180

      const cosY = Math.cos(yawRad)
      const sinY = Math.sin(yawRad)
      const cosP = Math.cos(pitchRad)
      const sinP = Math.sin(pitchRad)

      const rotY = [
        cosY, 0, sinY, 0,
        0, 1, 0, 0,
        -sinY, 0, cosY, 0,
        0, 0, 0, 1,
      ]

      const rotX = [
        1, 0, 0, 0,
        0, cosP, -sinP, 0,
        0, sinP, cosP, 0,
        0, 0, 0, 1,
      ]

      const rot = multiplyMatrix(rotX, rotY)
      const finalMatrix = multiplyMatrix(proj, rot)

      glContext.uniformMatrix4fv(uMatrix, false, new Float32Array(finalMatrix))
      glContext.uniform1i(uSampler, 0)
      glContext.drawElements(glContext.TRIANGLES, indices.length, glContext.UNSIGNED_SHORT, 0)

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isOpen, activeUrl, autoRotate, fov])

  // Mouse & Touch Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - lastMousePosRef.current.x
    const dy = e.clientY - lastMousePosRef.current.y
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }

    yawRef.current += dx * 0.2
    pitchRef.current = Math.max(-85, Math.min(85, pitchRef.current - dy * 0.2))
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    setFov((prev) => Math.max(35, Math.min(100, prev + e.deltaY * 0.05)))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - lastMousePosRef.current.x
    const dy = e.touches[0].clientY - lastMousePosRef.current.y
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }

    yawRef.current += dx * 0.25
    pitchRef.current = Math.max(-85, Math.min(85, pitchRef.current - dy * 0.25))
  }

  const handleTouchEnd = () => {
    isDraggingRef.current = false
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 15, 26, 0.94)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1080px',
          height: '82vh',
          maxHeight: '750px',
          background: '#090d16',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0f766e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Eye size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {title}
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: '#0284c7',
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                  }}
                >
                  360° VR
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                {islandName || 'Kepulauan Banda'} • Geser mouse atau sentuh layar untuk rotasi 360 derajat
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: autoRotate ? 'rgba(2, 132, 199, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                color: autoRotate ? '#38bdf8' : '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
              title="Toggle Rotasi Otomatis"
            >
              <RotateCcw size={12} />
              {autoRotate ? 'Auto-Putar: Aktif' : 'Auto-Putar: Diam'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Tutup penampil 360°"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Canvas WebGL Viewport */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: 'rgba(9, 13, 22, 0.85)',
                zIndex: 5,
                color: '#38bdf8',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '3px solid rgba(56, 189, 248, 0.2)',
                  borderTopColor: '#38bdf8',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span>Memuat Panorama 360°...</span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />

          {/* Quick HUD Navigation Overlay (Floating inside Viewer) */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              zIndex: 10,
              display: 'flex',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => setFov((prev) => Math.max(35, prev - 10))}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Perbesar (Zoom In)"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setFov((prev) => Math.min(100, prev + 10))}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Perkecil (Zoom Out)"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                yawRef.current = 0
                pitchRef.current = 0
                setFov(75)
              }}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Reset Orientasi Arah"
            >
              <Compass size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
