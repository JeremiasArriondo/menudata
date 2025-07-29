export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-primary-100 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-brand-text-200 mb-2">
          Cargando menú...
        </h2>
        <p className="text-brand-text-100">
          Preparando la mejor experiencia para ti
        </p>
      </div>
    </div>
  );
}
