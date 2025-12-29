export function Atmosphere() {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-nightclub pointer-events-none">
        {/* Smoke Layer 1 */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] animate-smoke">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary/20">
            <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90.1,-16.3,88.5,-0.9C86.9,14.4,81.1,28.8,72.1,40.4C63.1,52,50.8,60.8,37.7,67.8C24.5,74.8,10.6,80,0,80C-10.6,80,-21.2,74.8,-32.4,68.4C-43.7,62,-55.5,54.4,-65.4,43.5C-75.3,32.7,-83.1,18.5,-84,3.7C-84.9,-11.1,-78.9,-26.4,-69.8,-38.7C-60.7,-51,-48.5,-60.3,-35.4,-68C-22.3,-75.7,-8.4,-81.8,4.7,-89.9C17.7,-98,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        {/* Smoke Layer 2 (Opposite direction) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] animate-smoke [animation-duration:25s] [animation-delay:-5s]">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-secondary/30">
            <path fill="currentColor" d="M39.9,-65.7C50.3,-59.5,56.1,-45.6,62.2,-32.1C68.3,-18.6,74.7,-5.5,73.5,7.1C72.3,19.7,63.5,31.8,53.2,41.9C42.9,52,31.1,60.2,18.2,64.2C5.4,68.2,-8.4,68,-21.6,63.9C-34.8,59.8,-47.4,51.8,-56.3,40.8C-65.2,29.8,-70.4,15.9,-71.4,1.8C-72.3,-12.3,-69.1,-26.5,-61.2,-38.6C-53.3,-50.7,-40.7,-60.8,-27.4,-65.4C-14,-70.1,0.1,-69.2,14.6,-70.8C29.2,-72.4,39.9,-71.9,39.9,-65.7Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
    );
  }