import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Lamp } from "../../components/Lamp";
import { LoginForm, RegisterForm } from "../../components/Forms";

export default function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  // Generate floating particles
  useEffect(() => {
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }));
    setParticles(particleArray);
  }, []);

  // 3D Parallax effect tracking the mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * -30;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const toggleForms = () => setIsRegister(!isRegister);

  const fadeVariants = {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      scale: 0.96,
      y: 10,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(12px)",
      scale: 1.02,
      y: -10,
      transition: {
        duration: 0.6,
        ease: "easeIn",
      },
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#050914] overflow-hidden relative font-sans transition-colors duration-1000"

    >
      {/* Back to Home Navigation */}
      <button className="absolute top-8 left-8 z-50 p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all backdrop-blur-md flex items-center gap-2 pr-5 hover:scale-110 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Home</span>
      </button>

      <Lamp isOn={isRegister} toggle={toggleForms} />

      {/* Animated Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full blur-[1px] animate-[floatParticle_20s_ease-in-out_infinite] transition-colors duration-1000
            ${isRegister
              ? "bg-gradient-to-br from-amber-200/30 to-slate-800/70"
              : "bg-gradient-to-br from-amber-200/30 to-slate-800/70"
            }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Container tracking Mouse Hover for 3D Transform */}
      <div
        ref={containerRef}
        className="relative z-20 transition-transform duration-300 ease-out mt-24 sm:mt-32 w-[90vw] max-w-[420px] h-[600px] mx-auto"
        style={{
          transform: `perspective(1500px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
        }}
      >
        <div
          className="absolute inset-0"
        >
          <AnimatePresence mode="wait">
            {isRegister ? (
              <motion.div
                key="register"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0"
              >
                <RegisterForm onSwitch={toggleForms} />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0"
              >
                <LoginForm onSwitch={toggleForms} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes floatParticle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(10px, -30px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-5px, -60px) scale(0.8); opacity: 0.4; }
          75% { transform: translate(-15px, -30px) scale(1.1); opacity: 0.5; }
        }
      `,
        }}
      />
    </div>
  );
}