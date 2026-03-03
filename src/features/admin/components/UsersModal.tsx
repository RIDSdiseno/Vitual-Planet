export default function UsersModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-vp-border bg-vp-panel shadow-soft">
        <div className="flex items-center justify-between border-b border-vp-border p-4">
          <div className="text-sm font-semibold">Crear usuario (maqueta)</div>
          <button
            className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-1.5 text-sm hover:border-vp-primary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input className="w-full rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary" placeholder="Nombre" />
          <input className="w-full rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary" placeholder="Email" />
          <select className="w-full rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary">
            <option value="ADMIN">Admin</option>
            <option value="PROFESOR">Profesor</option>
            <option value="ESTUDIANTE">Estudiante</option>
          </select>

          <div className="pt-2 flex justify-end gap-2">
            <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-4 py-2 text-sm hover:border-vp-primary" onClick={onClose}>
              Cancelar
            </button>
            <button className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2" onClick={onClose}>
              Guardar
            </button>
          </div>

          <p className="text-xs text-vp-muted">
            Nota: este modal es solo UI. Después se conecta al users-service.
          </p>
        </div>
      </div>
    </div>
  );
}
