'use client';
import { useRive } from '@rive-app/react-canvas';

export const RivGirl = () => {
  const { RiveComponent } = useRive({
    src: '/girl.riv',
    autoplay: true,
  });

  return (
    <div className="min-h-screen" style={{ width: '500px', height: '100vh' }}>
      <RiveComponent />
    </div>
  );
};
