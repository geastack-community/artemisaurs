import { JSX, ReactNode } from 'react';
import StarryBackground from '../components/StarryBackground';

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps): JSX.Element {
  return (
    <>
      <StarryBackground />
      {children}
    </>
  );
}
