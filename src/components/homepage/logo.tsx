'use client'

import { Image } from '@mantine/core'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'

import DotPattern from '@/components/ui/dot-pattern'

export default function Logo() {
  const cardX = useMotionValue(0)
  const cardY = useMotionValue(0)
  const rotateX = useTransform(cardY, [-300, 300], [10, -10]) // Reversed values
  const rotateY = useTransform(cardX, [-300, 300], [-10, 10]) // Reversed values

  useEffect(() => {
    const main = document.getElementById('main')
    const handleMouseMove = (event: MouseEvent) => {
      if (!event) return
      const offsetX = event.clientX - window.innerWidth / 2
      const offsetY = event.clientY - window.innerHeight / 2

      cardX.set(offsetX)
      cardY.set(offsetY)
    }

    const handleMouseLeave = () => {
      animate(cardX, 0, { type: 'tween', stiffness: 10, damping: 1 })
      animate(cardY, 0, { type: 'tween', stiffness: 10, damping: 1 })
    }

    main?.addEventListener('mousemove', handleMouseMove)
    main?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      main?.removeEventListener('mousemove', handleMouseMove)
      main?.removeEventListener('mouseleave', handleMouseLeave)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DotPattern classname="mb-6 max-h-[300px] max-w-[400px] mx-auto shadow-nav dark:shadow-navDark">
      <motion.div
        style={{
          perspective: 800,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            perspective: 800,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            rotateX,
            rotateY,
          }}
          transition={{ velocity: 0 }}
          className="m-5"
        >
          <motion.div
            key="card"
            style={{
              transformStyle: 'preserve-3d',
              perspective: 800, // Set perspective on the card
            }}
            transition={{ velocity: 0 }}
            className="mx-auto w-container max-w-full px-5 text-center"
          >
            <Image src={'/assets/logo-transparent.png'} alt="Logo" className="w-[300px]" />
          </motion.div>
        </motion.div>
      </motion.div>
    </DotPattern>
  )
}
