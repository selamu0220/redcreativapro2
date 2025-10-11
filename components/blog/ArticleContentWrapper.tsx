'use client'

import React, { ReactNode, Children, isValidElement, cloneElement } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Componente de animación simple para párrafos
const SimpleAnimatedParagraph = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    amount: 0.5,
    margin: "0px 0px -50px 0px"
  })

  return (
    <motion.div
      ref={ref}
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Componente de animación simple para títulos
const SimpleAnimatedHeading = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.5,
    margin: "0px 0px -50px 0px"
  })

  return (
    <motion.div
      ref={ref}
      className="mb-4"
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Componente de animación simple para listas
const SimpleAnimatedList = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.2,
    margin: "0px 0px -80px 0px"
  })

  return (
    <motion.div
      ref={ref}
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// Componente de animación simple para imágenes
const SimpleAnimatedImage = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.3,
    margin: "0px 0px -100px 0px"
  })

  return (
    <motion.div
      ref={ref}
      className="mb-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Componente de animación simple para bloques de código
const SimpleAnimatedCodeBlock = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.2,
    margin: "0px 0px -100px 0px"
  })

  return (
    <motion.div
      ref={ref}
      className="mb-6"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Componente de animación simple para citas
const SimpleAnimatedQuote = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.4,
    margin: "0px 0px -80px 0px"
  })

  return (
    <motion.div
      ref={ref}
      className="mb-8"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Función para procesar elementos y aplicar animaciones
const processElement = (element: ReactNode, index: number): ReactNode => {
  if (!isValidElement(element)) {
    return element
  }

  const tagName = element.type as string

  // Animar párrafos
  if (tagName === 'p') {
    return (
      <SimpleAnimatedParagraph key={index}>
        {element}
      </SimpleAnimatedParagraph>
    )
  }

  // Animar títulos
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    return (
      <SimpleAnimatedHeading key={index}>
        {element}
      </SimpleAnimatedHeading>
    )
  }

  // Animar listas
  if (['ul', 'ol'].includes(tagName)) {
    return (
      <SimpleAnimatedList key={index}>
        {element}
      </SimpleAnimatedList>
    )
  }

  // Animar imágenes y figuras
  if (['img', 'figure'].includes(tagName)) {
    return (
      <SimpleAnimatedImage key={index}>
        {element}
      </SimpleAnimatedImage>
    )
  }

  // Animar bloques de código
  if (['pre', 'code'].includes(tagName) && element.props.className?.includes('language-')) {
    return (
      <SimpleAnimatedCodeBlock key={index}>
        {element}
      </SimpleAnimatedCodeBlock>
    )
  }

  // Animar citas
  if (tagName === 'blockquote') {
    return (
      <SimpleAnimatedQuote key={index}>
        {element}
      </SimpleAnimatedQuote>
    )
  }

  // Para divs, procesar recursivamente los hijos
  if (tagName === 'div' && element.props.children) {
    const processedChildren = Children.map(element.props.children, (child, childIndex) => 
      processElement(child, childIndex)
    )
    
    return cloneElement(element, { key: index }, processedChildren)
  }

  return element
}

// Componente principal ArticleContentWrapper
export default function ArticleContentWrapper({ children }: { children: ReactNode }) {
  const processedChildren = Children.map(children, (child, index) => 
    processElement(child, index)
  )

  return <>{processedChildren}</>
}