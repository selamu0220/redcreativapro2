'use client'
import React, { ReactNode, Children, isValidElement, cloneElement } from 'react'
// Componentes simples sin animaciones para evitar errores
const SimpleWrapper = ({ children, className = "mb-6" }: { children: ReactNode, className?: string }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
// Función para procesar elementos y aplicar wrappers simples
const processElement = (element: ReactNode, index: number): ReactNode => {
  if (!isValidElement(element)) {
    return element
  }
  const el = element as React.ReactElement<any>;
  const tagName = el.type as string
  // Wrapper para párrafos
  if (tagName === 'p') {
    return (
      <SimpleWrapper key={index} className="mb-6">
        {element}
      </SimpleWrapper>
    )
  }
  // Wrapper para títulos
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    return (
      <SimpleWrapper key={index} className="mb-4">
        {element}
      </SimpleWrapper>
    )
  }
  // Wrapper para listas
  if (['ul', 'ol'].includes(tagName)) {
    return (
      <SimpleWrapper key={index} className="mb-6">
        {element}
      </SimpleWrapper>
    )
  }
  // Wrapper para imágenes y figuras
  if (['img', 'figure'].includes(tagName)) {
    return (
      <SimpleWrapper key={index} className="mb-8">
        {element}
      </SimpleWrapper>
    )
  }
  // Wrapper para bloques de código
  if (['pre', 'code'].includes(tagName) && el.props.className?.includes('language-')) {
    return (
      <SimpleWrapper key={index} className="mb-6">
        {element}
      </SimpleWrapper>
    )
  }
  // Wrapper para citas
  if (tagName === 'blockquote') {
    return (
      <SimpleWrapper key={index} className="mb-8">
        {element}
      </SimpleWrapper>
    )
  }
  // Para divs, procesar recursivamente los hijos
  if (tagName === 'div' && el.props.children) {
    const processedChildren = Children.map(el.props.children, (child, childIndex) => 
      processElement(child, childIndex)
    )
    
    return cloneElement(el, { key: index }, processedChildren)
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