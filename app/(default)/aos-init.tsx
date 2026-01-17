'use client'

import { useEffect } from 'react'
import AOS from 'aos'

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 1000,
      easing: 'ease-out-cubic',
    })
  }, [])

  return null
}
