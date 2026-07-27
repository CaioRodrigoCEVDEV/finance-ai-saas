function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute -top-40 -left-20 w-[700px] h-[700px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 blur-3xl animate-glow-1" />
      <div className="absolute top-1/4 right-[5%] w-[500px] h-[500px] rounded-full bg-teal-400/10 dark:bg-teal-400/10 blur-3xl animate-glow-2 hidden md:block" />
      <div className="absolute -bottom-40 left-1/4 w-[800px] h-[800px] rounded-full bg-cyan-500/5 dark:bg-cyan-500/5 blur-3xl animate-glow-3" />
    </div>
  );
}

export default AnimatedBackground;
