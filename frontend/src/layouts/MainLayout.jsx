function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}

export default MainLayout;
