import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createWarehouse, deleteWarehouse, getWarehouseById, listWarehouses, updateWarehouse } from "../data/warehouses.js";
import { listMockPincodeDirectory } from "../utils/pincodeLookup.js";
import { normalizeWarehouseInput } from "../services/warehouseService.js";

export const warehouseRouter = Router();

warehouseRouter.get("/warehouse", requireAuth, (req, res) => {
  const editId = typeof req.query.edit === "string" ? req.query.edit : "";
  const editWarehouse = editId ? getWarehouseById(editId) : null;

  res.render("warehouse", {
    warehouses: listWarehouses(),
    editWarehouse,
    pincodeDirectory: listMockPincodeDirectory()
  });
});

warehouseRouter.post("/warehouse", requireAuth, async (req, res) => {
  const id = typeof req.body.id === "string" ? req.body.id : "";
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const contact_person_name = typeof req.body.contact_person_name === "string" ? req.body.contact_person_name.trim() : "";
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  const address = typeof req.body.address === "string" ? req.body.address.trim() : "";
  const pincode = typeof req.body.pincode === "string" ? req.body.pincode.trim() : "";
  const city = typeof req.body.city === "string" ? req.body.city.trim() : "";
  const state = typeof req.body.state === "string" ? req.body.state.trim() : "";

  if (!name || !contact_person_name || !phone || !address || !pincode) {
    res.redirect(`/warehouse${id ? `?edit=${encodeURIComponent(id)}` : ""}`);
    return;
  }

  const normalizedWarehouse = await normalizeWarehouseInput({
    name,
    contact_person_name,
    phone,
    address,
    pincode,
    city,
    state
  });

  if (!normalizedWarehouse.city || !normalizedWarehouse.state) {
    res.redirect(`/warehouse${id ? `?edit=${encodeURIComponent(id)}` : ""}`);
    return;
  }

  if (id) {
    updateWarehouse(id, normalizedWarehouse);
  } else {
    createWarehouse(normalizedWarehouse);
  }

  res.redirect("/warehouse");
});

warehouseRouter.post("/warehouse/:id/delete", requireAuth, (req, res) => {
  deleteWarehouse(req.params.id);
  res.redirect("/warehouse");
});
