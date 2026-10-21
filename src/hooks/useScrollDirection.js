import { useSyncExternalStore } from 'react';

let direction = 'down';
let lastScrollY = typeof window === 'undefined' ? 0 : window.scrollY;
const subscribers = new Set();
let listening = false;

function updateDirection() {
  const currentScrollY = window.scrollY;
  const nextDirection = currentScrollY >= lastScrollY ? 'down' : 'up';
  lastScrollY = currentScrollY;
  if (nextDirection === direction) return;
  direction = nextDirection;
  subscribers.forEach((subscriber) => subscriber());
}

function subscribe(subscriber) {
  subscribers.add(subscriber);
  if (!listening && typeof window !== 'undefined') {
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', updateDirection, { passive: true });
    listening = true;
  }
  return () => {
    subscribers.delete(subscriber);
    if (listening && subscribers.size === 0) {
      window.removeEventListener('scroll', updateDirection);
      listening = false;
    }
  };
}

const getSnapshot = () => direction;
const getServerSnapshot = () => 'down';

export default function useScrollDirection() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
