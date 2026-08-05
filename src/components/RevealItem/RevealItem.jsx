import { useScrollReveal } from '../../hooks/useScrollReveal'

// 리스트/그리드 아이템을 감싸지 않고 그 자체가 되도록 만들어서
// (className을 그대로 이어받음) 기존 grid/flex 레이아웃을 깨지 않는다.
export default function RevealItem({ children, index = 0, className = '', as: Tag = 'div', ...props }) {
  const [ref, visible] = useScrollReveal()

  return (
    <Tag
      ref={ref}
      className={`fdt-reveal ${visible ? 'fdt-reveal-visible' : ''} ${className}`}
      style={{ '--reveal-i': index }}
      {...props}
    >
      {children}
    </Tag>
  )
}
