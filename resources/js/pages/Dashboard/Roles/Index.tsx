import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import {
  IconCirclePlus,
  IconTrash,
  IconUserShield,
  IconPencilCog,
  IconPencilCheck,
  IconShield,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import roles from "@/routes/roles";
import { Pagination } from "@/components/dashboard/pagination";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface RolesResponse {
  data: Role[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

function RoleCard({
  role,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg transition-all hover:shadow-lg">
      <div className="border-border border-b p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white">
            <IconUserShield size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-fg text-lg capitalize">{role.name}</h3>
            <p className="text-muted-fg text-sm">{role.permissions.length} hak akses</p>
          </div>
        </div>
      </div>

      <div className="bg-muted p-4">
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
          {role.permissions.slice(0, 8).map((permission, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs"
            >
              <IconShield size={10} />
              {permission.name}
            </span>
          ))}
          {role.permissions.length > 8 && (
            <span className="px-2 py-0.5 font-medium text-muted-fg text-xs">
              +{role.permissions.length - 8} lainnya
            </span>
          )}
        </div>
      </div>

      {(canUpdate || canDelete) && (
        <div className="flex border-border border-t">
          {canUpdate && (
            <button
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 font-medium text-sm text-warning transition-colors hover:bg-warning/5"
            >
              <IconPencilCog size={16} />
              <span>Edit</span>
            </button>
          )}
          {canUpdate && canDelete && <div className="w-px bg-border" />}
          {canDelete && (
            <button
              onClick={onDelete}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 font-medium text-danger text-sm transition-colors hover:bg-danger/5"
            >
              <IconTrash size={16} />
              <span>Hapus</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Index() {
  const {
    roles: rolesData,
    permissions: allPermissions,
    errors,
  } = usePage().props as unknown as {
    roles: RolesResponse;
    permissions: Permission[];
    errors: Record<string, string>;
  };
  const { can } = useAuthorization();
  const canCreateRoles = can("roles-create");
  const canUpdateRoles = can("roles-update");
  const canDeleteRoles = can("roles-delete");

  const [modalOpen, setModalOpen] = useState(false);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formSelectedPermission, setFormSelectedPermission] = useState<Permission[]>([]);
  const [formIsUpdate, setFormIsUpdate] = useState(false);

  const [processing, setProcessing] = useState(false);

  function resetForm() {
    setFormId("");
    setFormName("");
    setFormSelectedPermission([]);
    setFormIsUpdate(false);
    setModalOpen(false);
  }

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function handleEdit(role: Role) {
    setFormId(String(role.id));
    setFormName(role.name);
    setFormSelectedPermission(role.permissions);
    setFormIsUpdate(true);
    setModalOpen(true);
  }

  function togglePermission(permission: Permission) {
    setFormSelectedPermission((prev) => {
      if (prev.some((p) => p.id === permission.id)) {
        return prev.filter((p) => p.id !== permission.id);
      }
      return [...prev, permission];
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    const payload = {
      name: formName,
      selectedPermission: formSelectedPermission.map((p) => p.id),
    };

    if (formIsUpdate) {
      router.post(
        roles.update(parseFloat(formId)).url,
        {
          ...payload,
          _method: "PUT",
        } as any,
        {
          onSuccess: () => {
            resetForm();
            setProcessing(false);
          },
          onError: () => setProcessing(false),
        },
      );
    } else {
      router.post(roles.store.url(), payload, {
        onSuccess: () => {
          resetForm();
          setProcessing(false);
        },
        onError: () => setProcessing(false),
      });
    }
  }

  function handleDelete(roleId: number) {
    if (!confirm("Hapus role ini?")) return;
    router.delete(roles.destroy.url({ role: roleId }));
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    router.get(roles.index.url({ query: { search } }), {}, { preserveState: true, replace: true });
  }

  return (
    <>
      <Head title="Akses Group" />

      <div className="mb-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconUserShield size={28} className="text-primary" />
              Akses Group
            </h1>
            <p className="text-muted-fg text-sm">
              {rolesData.total || rolesData.data?.length || 0} group terdaftar
            </p>
          </div>
          {canCreateRoles && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              <IconCirclePlus size={18} strokeWidth={1.5} />
              Tambah Group
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 w-full sm:w-80">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            placeholder="Cari akses group..."
            className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-border bg-bg p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-2">
              <IconUserShield size={20} strokeWidth={1.5} className="text-primary" />
              <h2 className="font-semibold text-fg text-lg">
                {formIsUpdate ? "Ubah Akses Group" : "Tambah Akses Group"}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block font-medium text-fg text-sm">Nama group</label>
                <input
                  type="text"
                  placeholder="Masukan nama group"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.name && <p className="mt-1 text-danger text-sm">{errors.name}</p>}
              </div>
              <div className="mb-4">
                <label className="mb-2 block font-medium text-fg text-sm">Pilih hak akses</label>
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-border p-3">
                  {allPermissions.length === 0 ? (
                    <p className="text-muted-fg text-sm">Tidak ada hak akses tersedia.</p>
                  ) : (
                    allPermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={formSelectedPermission.some((p) => p.id === perm.id)}
                          onChange={() => togglePermission(perm)}
                          className="rounded border-border text-primary focus:ring-ring"
                        />
                        <span className="text-fg text-sm">{perm.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {errors.selectedPermission && (
                  <p className="mt-1 text-danger text-sm">{errors.selectedPermission}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <IconPencilCheck size={18} />
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {rolesData.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rolesData.data.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => handleEdit(role)}
              onDelete={() => handleDelete(role.id)}
              canUpdate={canUpdateRoles}
              canDelete={canDeleteRoles}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Group"
          description="Tambahkan group akses pertama."
          icon={<IconUserShield size={32} className="text-muted-fg" strokeWidth={1.5} />}
          action={
            canCreateRoles ? (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-primary/90"
              >
                <IconCirclePlus size={18} />
                Tambah Group
              </button>
            ) : undefined
          }
        />
      )}

      <Pagination links={rolesData.links} />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
