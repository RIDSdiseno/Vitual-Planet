import { useEffect, useMemo, useState } from "react";
import type { Plan, Tenant, TenantStatus, TenantType } from "../../../../services/tenants";

type Mode = "create" | "edit";

function uid(prefix = "t_") {
  return `${prefix}${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function TenantModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: Mode;
  initial?: Tenant | null;
  onClose: () => void;
  onSubmit: (tenant: Tenant) => void;
}) {
  const isEdit = mode === "edit";

  const [type, setType] = useState<TenantType>("SCHOOL");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Chile");
  const [status, setStatus] = useState<TenantStatus>("TRIAL");
  const [plan, setPlan] = useState<Plan>("BASIC");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const [mrr, setMrr] = useState<number>(19900);
  const [nextInvoiceDate, setNextInvoiceDate] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (isEdit ? "Editar tenant" : "Crear tenant"), [isEdit]);

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (isEdit && initial) {
      setType(initial.type);
      setName(initial.name);
      setCity(initial.city ?? "");
      setCountry(initial.country ?? "Chile");
      setStatus(initial.status);
      setPlan(initial.plan);
      setOwnerName(initial.ownerName);
      setOwnerEmail(initial.ownerEmail);
      setMrr(initial.billing.mrr);
      setNextInvoiceDate(initial.billing.nextInvoiceDate);
      return;
    }

    // create defaults
    setType("SCHOOL");
    setName("");
    setCity("");
    setCountry("Chile");
    setStatus("TRIAL");
    setPlan("BASIC");
    setOwnerName("");
    setOwnerEmail("");
    setMrr(19900);
    setNextInvoiceDate("");
  }, [open, isEdit, initial]);

  if (!open) return null;

  function validate() {
    if (!name.trim()) return "El nombre del tenant es obligatorio.";
    if (!ownerName.trim()) return "El nombre del responsable es obligatorio.";
    if (!ownerEmail.trim()) return "El email del responsable es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) return "Email inválido.";
    if (!Number.isFinite(mrr) || mrr < 0) return "MRR inválido.";
    return null;
  }

  function handleSubmit() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const now = new Date();
    const createdAt =
      initial?.createdAt ??
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const tenant: Tenant = {
      id: initial?.id ?? uid(type === "SCHOOL" ? "t_school_" : "t_solo_"),
      type,
      name: name.trim(),
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      status,
      plan,
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      metrics: initial?.metrics ?? { students: 0, teachers: type === "SOLO_TEACHER" ? 1 : 0, courses: 0 },
      billing: {
        currency: "CLP",
        mrr: Number(mrr) || 0,
        nextInvoiceDate: (nextInvoiceDate || "").trim() || createdAt,
      },
      createdAt,
    };

    onSubmit(tenant);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3 sm:p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-vp-border bg-vp-panel shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-vp-border p-4 sm:p-5">
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-vp-muted">Maqueta • sin APIs</div>
          </div>
          <button
            className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm hover:border-vp-primary/30"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="rounded-2xl border border-vp-border bg-vp-soft/30 p-3 text-sm text-vp-text">
              {error}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-vp-muted">Tipo</label>
              <select
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={type}
                onChange={(e) => setType(e.target.value as TenantType)}
                disabled={isEdit} // en edit normalmente no cambias el tipo
              >
                <option value="SCHOOL">Colegio</option>
                <option value="SOLO_TEACHER">Particular</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-vp-muted">Estado</label>
              <select
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={status}
                onChange={(e) => setStatus(e.target.value as TenantStatus)}
              >
                <option value="ACTIVE">Activo</option>
                <option value="TRIAL">Trial</option>
                <option value="PAST_DUE">Con deuda</option>
                <option value="SUSPENDED">Suspendido</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-vp-muted">Nombre del tenant</label>
              <input
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Colegio San Martín"
              />
            </div>

            <div>
              <label className="text-xs text-vp-muted">Ciudad</label>
              <input
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Santiago"
              />
            </div>

            <div>
              <label className="text-xs text-vp-muted">País</label>
              <input
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Chile"
              />
            </div>

            <div>
              <label className="text-xs text-vp-muted">Plan</label>
              <select
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={plan}
                onChange={(e) => setPlan(e.target.value as Plan)}
              >
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-vp-muted">MRR (CLP)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={mrr}
                onChange={(e) => setMrr(Number(e.target.value))}
                min={0}
              />
            </div>

            <div>
              <label className="text-xs text-vp-muted">Próxima factura (YYYY-MM-DD)</label>
              <input
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={nextInvoiceDate}
                onChange={(e) => setNextInvoiceDate(e.target.value)}
                placeholder="2026-03-05"
              />
            </div>

            <div>
              <label className="text-xs text-vp-muted">Responsable</label>
              <input
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej: María Soto"
              />
            </div>

            <div>
              <label className="text-xs text-vp-muted">Email responsable</label>
              <input
                className="mt-1 w-full rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="maria@colegio.cl"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-2">
            <button
              className="w-full sm:w-auto rounded-2xl border border-vp-border bg-white px-4 py-2 text-sm hover:border-vp-primary/30"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="w-full sm:w-auto rounded-2xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2 focus:outline-none focus:ring-4 focus:ring-vp-primary/10"
              onClick={handleSubmit}
            >
              {isEdit ? "Guardar cambios" : "Crear tenant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}