import { FormEvent, useEffect, useState } from "react";
import { getWarehouses, saveWarehouse, deleteWarehouse, lookupPincode, type Warehouse } from "../api/warehouse.js";
import { Layout } from "../components/Layout.js";

const emptyForm = (): Partial<Warehouse> => ({
  name: "", contact_person_name: "", phone: "", address: "", pincode: "", city: "", state: ""
});

export function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form, setForm] = useState<Partial<Warehouse>>(emptyForm());
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const load = () =>
    getWarehouses().then(({ warehouses: w }) => setWarehouses(w)).catch(() => null);

  useEffect(() => { load(); }, []);

  const handlePincodeBlur = async () => {
    if (!form.pincode || form.pincode.length !== 6) return;
    setPincodeLoading(true);
    try {
      const result = await lookupPincode(form.pincode);
      setForm((f) => ({ ...f, city: result.city, state: result.state }));
    } catch {
      // pincode not found
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveWarehouse(editing ? { ...form, id: editing } : form);
      setForm(emptyForm());
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (w: Warehouse) => {
    setEditing(w.id);
    setForm({ name: w.name, contact_person_name: w.contact_person_name, phone: w.phone, address: w.address, pincode: w.pincode, city: w.city, state: w.state });
  };

  const handleDelete = async (id: string) => {
    await deleteWarehouse(id).catch(() => null);
    await load();
  };

  const field = (key: keyof Warehouse, label: string, type = "text") => (
    <div className="field">
      <label className="label" htmlFor={key}>{label}</label>
      <input
        id={key}
        className="input"
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        onBlur={key === "pincode" ? handlePincodeBlur : undefined}
        required={key !== "city" && key !== "state"}
      />
    </div>
  );

  return (
    <Layout eyebrow="Operations" title="Warehouses">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", alignItems: "start" }}>
        <section className="card">
          <h2 style={{ marginBottom: "1rem" }}>{editing ? "Edit Warehouse" : "Add Warehouse"}</h2>
          <form onSubmit={handleSubmit}>
            {field("name", "Warehouse Name")}
            {field("contact_person_name", "Contact Person")}
            {field("phone", "Phone")}
            {field("address", "Address")}
            {field("pincode", "Pincode")}
            {pincodeLoading && <p className="muted small">Looking up pincode…</p>}
            {field("city", "City")}
            {field("state", "State")}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Update" : "Add Warehouse"}
              </button>
              {editing && (
                <button className="btn btn-soft" type="button" onClick={() => { setEditing(null); setForm(emptyForm()); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <h2 style={{ marginBottom: "1rem" }}>Warehouses ({warehouses.length})</h2>
          {warehouses.length === 0 && <p className="muted">No warehouses yet.</p>}
          <div className="stack-list">
            {warehouses.map((w) => (
              <div key={w.id} className="stack-row">
                <div className="row-stack">
                  <strong>{w.name}</strong>
                  <span className="muted small">{w.address}, {w.city}, {w.state} – {w.pincode}</span>
                  <span className="muted small">{w.contact_person_name} · {w.phone}</span>
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className="btn btn-sm btn-soft" type="button" onClick={() => handleEdit(w)}>Edit</button>
                  <button className="btn btn-sm btn-soft" type="button" onClick={() => handleDelete(w.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
