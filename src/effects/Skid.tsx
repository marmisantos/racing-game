import { Euler, Object3D, Vector3, Matrix4 } from 'three'
import { useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { InstancedMesh } from 'three'

import { getState, mutation, useStore } from '../store'
import type { Controls } from '../store'

const e = new Euler()
const m = new Matrix4()
const o = new Object3D()
const v = new Vector3()

interface SkidProps {
  count?: number
  opacity?: number
  size?: number
}

export function Skid({ count = 500, opacity = 0.5, size = 0.4 }: SkidProps): JSX.Element {
  const ref = useRef<InstancedMesh>(null)
  const { wheels, chassisBody } = useStore((state) => state)

  let controls: Controls
  let index = 0
  useFrame(() => {
    controls = getState().controls
    if (controls.brake && mutation.speed > 10) {
      e.setFromRotationMatrix(m.extractRotation(chassisBody.current!.matrix))
      setItemAt(ref, e, wheels[2].current!.getWorldPosition(v), index++)
      setItemAt(ref, e, wheels[3].current!.getWorldPosition(v), index++)
      if (index === count) index = 0
    }
  })

  useLayoutEffect(() => void ref.current!.geometry.rotateX(-Math.PI / 2), [])

  return (
    // @ts-expect-error - https://github.com/three-types/three-ts-types/issues/92
    <instancedMesh ref={ref} args={[null, null, count]}>
      <planeGeometry args={[size, size * 2]} />
      <meshBasicMaterial color="black" transparent opacity={opacity} depthWrite={false} />
    </instancedMesh>
  )
}

function setItemAt(ref: RefObject<InstancedMesh>, rotation: Euler, position: Vector3, index: number) {
  o.position.set(position.x, position.y - 0, position.z)
  o.rotation.copy(rotation)
  o.scale.setScalar(1)
  o.updateMatrix()
  ref.current!.setMatrixAt(index, o.matrix)
  ref.current!.instanceMatrix.needsUpdate = true
}
