"use client";
import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Based on a simplified version of Aceternity's BackgroundBeams
export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Basic canvas texturing/animation placeholder for the "Modern Graphics" feel
    // A true complex path animation is lengthy; this provides a subtle grid + ambient movement
    const canvas = beamsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let authentication = true; 
    // We'll respect cleanup.
    
    // Resize handler
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Simplified particle/beam animation for graphics effect
    const particles: {x: number, y: number, size: number, speedX: number, speedY: number, alpha: number}[] = [];
    for(let i=0; i<50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5
        });
    }

    const animate = () => {
        if (!authentication) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Add a subtle gradient overlay in canvas if needed, or rely on CSS
        
        requestAnimationFrame(animate);
    }
    animate();

    return () => {
        authentication = false;
        window.removeEventListener("resize", resizeCanvas);
    }
  }, []);

  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 pointer-events-none",
        className
      )}
    >
        <div className="absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <canvas ref={beamsRef} className="absolute inset-0 z-0 h-full w-full opacity-30" />
    </div>
  );
};
