import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createWarehouse, getWarehouseById, listWarehouses, updateWarehouse } from "../data/warehouses.js";

export const warehouseRouter = Router();

warehouseRouter.get("/warehouse", requireAuth, (req, res) => {
  const editId = typeof req.query.edit === "string" ? req.query.edit : "";
  const editWarehouse = editId ? getWarehouseById(editId) : null;

  res.render("warehouse", {
    warehouses: listWarehouses(),
    editWarehouse
  });
});

warehouseRouter.post("/warehouse", requireAuth, (req, res) => {
  const id = typeof req.body.id === "string" ? req.body.id : "";
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const address = typeof req.body.address === "string" ? req.body.address.trim() : "";
  const pincode = typeof req.body.pincode === "string" ? req.body.pincode.trim() : "";

  if (!name || !address || !pincode) {
    res.redirect(`/warehouse${id ? `?edit=${encodeURIComponent(id)}` : ""}`);
    return;
  }

  if (id) {
    updateWarehouse(id, { name, address, pincode });
  } else {
    createWarehouse({ name, address, pincode });
  }

  res.redirect("/warehouse");
});
