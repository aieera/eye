import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, FolderTree } from "lucide-react";
import {
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../api/categoryApi";
import type { CategoryTreeNode } from "../types/category.types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Categories() {
  const { toast } = useToast();
  const { data: treeRes, isLoading } = useGetCategoryTreeQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const tree = treeRes?.data ?? [];

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<CategoryTreeNode | null>(null);

  const [form, setForm] = useState({
    name: "",
    level: "dept" as "dept" | "class" | "subclass",
    parentId: "" as string | undefined,
    oracleDept: "",
    oracleClass: "",
    oracleSubclass: "",
    displayOrder: 0,
  });

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const openCreate = (parentId?: string, level?: "dept" | "class" | "subclass") => {
    setEditTarget(null);
    setForm({
      name: "",
      level: level || "dept",
      parentId: parentId || "",
      oracleDept: "",
      oracleClass: "",
      oracleSubclass: "",
      displayOrder: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (node: CategoryTreeNode) => {
    setEditTarget(node);
    setForm({
      name: node.name,
      level: node.level as "dept" | "class" | "subclass",
      parentId: undefined,
      oracleDept: node.oracleDept || "",
      oracleClass: node.oracleClass || "",
      oracleSubclass: node.oracleSubclass || "",
      displayOrder: node.displayOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required" });
      return;
    }

    try {
      if (editTarget) {
        await updateCategory({
          id: editTarget.id,
          body: {
            name: form.name,
            oracleDept: form.oracleDept || undefined,
            oracleClass: form.oracleClass || undefined,
            oracleSubclass: form.oracleSubclass || undefined,
            displayOrder: form.displayOrder,
          },
        }).unwrap();
        toast({ title: "Category updated" });
      } else {
        await createCategory({
          name: form.name,
          level: form.level,
          parentId: form.parentId || undefined,
          oracleDept: form.oracleDept || undefined,
          oracleClass: form.oracleClass || undefined,
          oracleSubclass: form.oracleSubclass || undefined,
          displayOrder: form.displayOrder,
        }).unwrap();
        toast({ title: "Category created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Something went wrong" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget).unwrap();
      toast({ title: "Category deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Cannot delete category" });
    }
    setDeleteTarget(null);
  };

  const renderNode = (node: CategoryTreeNode, depth: number) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 border-b group ${
            depth === 0 ? "bg-white" : depth === 1 ? "bg-gray-50/50" : "bg-gray-50/30"
          }`}
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button onClick={() => toggle(node.id)} className="p-1">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-7" />
            )}
            <span className={`${depth === 0 ? "font-semibold" : depth === 1 ? "font-medium" : "text-sm text-gray-600"}`}>
              {node.name}
            </span>
            {node.oracleDept && (
              <span className="text-xs text-gray-400 font-mono">
                [{node.oracleDept}{node.oracleClass ? `/${node.oracleClass}` : ""}{node.oracleSubclass ? `/${node.oracleSubclass}` : ""}]
              </span>
            )}
            <Badge variant="secondary" className="text-xs">
              {node.productCount} products
            </Badge>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.level === "dept" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openCreate(node.id, "class")}
                title="Add subclass"
              >
                <Plus size={14} />
              </Button>
            )}
            {node.level === "class" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openCreate(node.id, "subclass")}
                title="Add subclass"
              >
                <Plus size={14} />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => openEdit(node)}>
              <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(node.id)}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>

        {isExpanded &&
          hasChildren &&
          node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories hierarchy</p>
        </div>
        <Button onClick={() => openCreate()} className="bg-purple-900 hover:bg-purple-800">
          <Plus size={18} className="mr-2" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : tree.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <FolderTree size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No categories found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first category to get started</p>
          <Button onClick={() => openCreate()} className="mt-4 bg-purple-900 hover:bg-purple-800">
            Add Category
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {tree.map((node) => renderNode(node, 0))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            {!editTarget && (
              <div>
                <Label>Level</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) =>
                    setForm({ ...form, level: v as "dept" | "class" | "subclass" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dept">Department</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="subclass">Subclass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Oracle Dept</Label>
                <Input
                  value={form.oracleDept}
                  onChange={(e) => setForm({ ...form, oracleDept: e.target.value })}
                  placeholder="e.g. 100"
                />
              </div>
              <div>
                <Label className="text-xs">Oracle Class</Label>
                <Input
                  value={form.oracleClass}
                  onChange={(e) => setForm({ ...form, oracleClass: e.target.value })}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <Label className="text-xs">Oracle Subclass</Label>
                <Input
                  value={form.oracleSubclass}
                  onChange={(e) => setForm({ ...form, oracleSubclass: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-900 hover:bg-purple-800">
              {editTarget ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the category. Categories with products or subcategories cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
