import { Suspense } from 'react';
import { HomeScreen } from './home-screen';

export default function HomePage() {
  return (
    <Suspense>
      <HomeScreen />
    </Suspense>
  );
}
