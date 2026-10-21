import { motion, useReducedMotion } from 'framer-motion';
import useScrollDirection from '../hooks/useScrollDirection.js';

const transition = { duration: 0.52, ease: [0.22, 1, 0.36, 1] };

export default function Reveal({ as = 'div', className, children, delay = 0, hover = false, ...props }) {
  const reduceMotion = useReducedMotion();
  const scrollDirection = useScrollDirection();
  const Element = motion[as];
  return <Element
    className={className}
    initial={reduceMotion ? false : { opacity: 0, y: scrollDirection === 'down' ? 14 : -14 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={hover && !reduceMotion ? { y: -2 } : undefined}
    viewport={{ once: false, amount: 0.16 }}
    transition={{ ...transition, delay: reduceMotion ? 0 : delay }}
    {...props}
  >{children}</Element>;
}
