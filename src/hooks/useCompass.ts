import { useState, useEffect, useRef } from 'react';

export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  
  const prevHeadingRef = useRef<number | null>(null);
  const cumulativeHeadingRef = useRef<number>(0);

  const processHeading = (newHeading: number) => {
    if (prevHeadingRef.current === null) {
      prevHeadingRef.current = newHeading;
      cumulativeHeadingRef.current = newHeading;
      return newHeading;
    }

    let delta = newHeading - prevHeadingRef.current;
    
    // Adjust for the 0-360 wrap around
    if (delta > 180) {
      delta -= 360;
    } else if (delta < -180) {
      delta += 360;
    }

    cumulativeHeadingRef.current += delta;
    prevHeadingRef.current = newHeading;
    
    return cumulativeHeadingRef.current;
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let webkitHeading = (event as any).webkitCompassHeading;
      let alpha = event.alpha;

      if (webkitHeading != null) {
        setHeading(processHeading(webkitHeading));
        setIsAvailable(true);
      } else if (alpha != null) {
        setHeading(processHeading(360 - alpha)); 
        setIsAvailable(true);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // Handle iOS 13+ permission - this typically needs to be triggered by a user gesture.
        // We will expose a method to request permission.
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await ((DeviceOrientationEvent as any).requestPermission() as Promise<string>);
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', (e) => {
             let webkitHeading = (e as any).webkitCompassHeading;
             if (webkitHeading != null) setHeading(processHeading(webkitHeading));
             setIsAvailable(true);
          }, true);
        }
      } catch (err) {
         console.warn("DeviceOrientation permission error", err);
      }
    }
  };

  return { heading, isAvailable, requestPermission };
}
