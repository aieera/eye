import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, FolderTree } from "lucide-react";
import {
  useGetCategoryTreeQuery, useCreateCategoryMutation,
  useUpdateCategoryMutation, useDeleteCategoryMutation,
} from "../api/categoryApi";
import type { CategoryTreeNode } from "../types/category.types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
    name: "", level: "dept" as "dept" | "class" | "subclass",
    parentId: "" as string | undefined,
    oracleDept: "", oracleClass: "", oracleSubclass: "", displayOrder: 0,
  });

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const openCreate = (parentId?: string, level?: "dept" | "class" | "subclass") => {
    setEditTarget(null);
    setForm({ name: "", level: level || "dept", parentId: parentId || "", oracleDept: "", oracleClass: "", oracleSubclass: "", displayOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (node: CategoryTreeNode) => {
    setEditTarget(node);
    setForm({ name: node.name, level: node.level as any, parentId: undefined, oracleDept: node.oracleDept || "", oracleClass: node.oracleClass || "", oracleSubclass: node.oracleSubclass || "", displayOrder: node.displayOrder });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name is required" }); return; }
    try {
      if (editTarget) {
        await updateCategory({ id: editTarget.id, body: { name: form.name, oracleDept: form.oracleDept || undefined, oracleClass: form.oracleClass || undefined, oracleSubclass: form.oracleSubclass || undefined, displayOrder: form.displayOrder } }).unwrap();
        toast({ title: "Category updated" });
      } else {
        await createCategory({ name: form.name, level: form.level, parentId: form.parentId || undefined, oracleDept: form.oracleDept || undefined, oracleClass: form.oracleClass || undefined, oracleSubclass: form.oracleSubclass || undefined, displayOrder: form.displayOrder }).unwrap();
        toast({ title: "Category created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Something went wrong", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget).unwrap();
      toast({ title: "Category deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.data?.message || "Cannot delete category", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const renderNode = (node: CategoryTreeNode, depth: number) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className="flex items-center justify-between py-2.5 px-4 hover:bg-muted/20 transition-colors group"
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
        >
          {/* Left: expand + name */}
          <div className="flex items-center gap-2">
            {depth > 0 && <div className="border-l border-border/40 h-4 mr-1" />}
            {hasChildren ? (
              <button onClick={() => toggle(node.id)} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className={`text-sm ${depth === 0 ? "font-semibold text-foreground" : depth === 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
              {node.name}
            </span>
            {node.oracleDept && (
              <span className="text-[10px] font-mono text-muted-foreground/40">
                [{node.oracleDept}{node.oracleClass ? `/${node.oracleClass}` : ""}{node.oracleSubclass ? `/${node.oracleSubclass}` : ""}]
              </span>
            )}
            <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {node.productCount}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.level === "dept" && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openCreate(node.id, "class")}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
            {node.level === "class" && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openCreate(node.id, "subclass")}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(node)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-red-600" onClick={() => setDeleteTarget(node.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {isExpanded && hasChildren && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage product categories hierarchy</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
      ) : tree.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card p-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <FolderTree className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No categories</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first category to organise products</p>
          <button onClick={() => openCreate()} className="h-8 rounded-lg border border-border bg-card text-sm px-3 hover:bg-muted/50 transition-colors">
            Add Category
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden bg-card divide-y divide-border/40">
          {tree.map((node) => renderNode(node, 0))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" className="h-9" />
            </div>
            {!editTarget && (
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as any })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dept">Department</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="subclass">Subclass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {[["oracleDept", "Oracle Dept"], ["oracleClass", "Oracle Class"], ["oracleSubclass", "Oracle Sub"]].map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-8 text-xs" />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">{editTarget ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>Categories with products or subcategories cannot be deleted.</AlertDialogDescription>
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
