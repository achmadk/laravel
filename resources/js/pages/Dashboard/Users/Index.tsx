import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconCirclePlus,
  IconTrash,
  IconPencilCog,
  IconUser,
  IconMail,
  IconShield,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import users from "@/routes/users";
import { Pagination } from "@/components/dashboard/pagination";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  roles: Role[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface UsersResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

function UserCard({
  user,
  isSelected,
  onSelect,
  onDelete,
  canUpdate,
  canDelete,
}: {
  user: User;
  isSelected: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  const initial =
    user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={`group bg-bg rounded-2xl border-2 overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-200 ${
        isSelected ? "border-primary" : "border-border"
      }`}
    >
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-fg">{user.name}</h3>
            <p className="text-sm text-muted-fg flex items-center gap-1">
              <IconMail size={14} />
              {user.email}
            </p>
          </div>
        </div>
        {canDelete && (
          <input
            type="checkbox"
            value={user.id}
            onChange={onSelect}
            checked={isSelected}
            className="rounded border-border text-primary focus:ring-ring"
          />
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {user.roles.map((role, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning"
            >
              <IconShield size={12} />
              {role.name}
            </span>
          ))}
        </div>
      </div>

      {(canUpdate || canDelete) && (
        <div className="flex border-t border-border">
          {canUpdate && (
            <Link
              href={users.edit.url({ user: user.id })}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-warning hover:bg-warning/5 text-sm font-medium transition-colors"
            >
              <IconPencilCog size={16} />
              <span>Edit</span>
            </Link>
          )}
          {canUpdate && canDelete && <div className="w-px bg-border" />}
          {canDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-danger hover:bg-danger/5 text-sm font-medium transition-colors"
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
  const { users: usersData } = usePage().props as unknown as { users: UsersResponse };
  const { can } = useAuthorization();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const canCreateUsers = can("users-create");
  const canUpdateUsers = can("users-update");
  const canDeleteUsers = can("users-delete");

  const [selectedUser, setSelectedUser] = useState<string[]>([]);

  function handleSelectUser(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedUser((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value],
    );
  }

  function deleteData(id: number | string) {
    if (!confirm("Hapus pengguna? Data yang dihapus tidak dapat dikembalikan!")) return;
    router.delete(users.destroy.url({ user: String(id) }), {
      onSuccess: () => setSelectedUser([]),
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    router.get(users.index.url({ query: { search } }), {}, { preserveState: true, replace: true });
  }

  const allSelected = usersData.data.length > 0 && selectedUser.length === usersData.data.length;

  return (
    <>
      <Head title="Pengguna" />

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg">Pengguna</h1>
            <p className="text-sm text-muted-fg">
              {usersData.total || usersData.data?.length || 0} pengguna terdaftar
            </p>
          </div>
          <div className="flex gap-2">
            {canDeleteUsers && selectedUser.length > 0 && (
              <button
                onClick={() => selectedUser.forEach((user) => deleteData(user))}
                className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger/90"
              >
                <IconTrash size={18} />
                Hapus {selectedUser.length}
              </button>
            )}
            {canCreateUsers && (
              <Link
                href={users.create.url()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
              >
                <IconCirclePlus size={18} strokeWidth={1.5} />
                Tambah Pengguna
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="w-full sm:w-80">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              name="search"
              placeholder="Cari pengguna..."
              className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
            />
          </form>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-fg hover:bg-muted"
            }`}
          >
            <IconLayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-fg hover:bg-muted"
            }`}
          >
            <IconList size={20} />
          </button>
        </div>
      </div>

      {usersData.data.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {usersData.data.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isSelected={selectedUser.includes(String(user.id))}
                onSelect={handleSelectUser}
                onDelete={(id) => deleteData(id)}
                canUpdate={canUpdateUsers}
                canDelete={canDeleteUsers}
              />
            ))}
          </div>
        ) : (
          <div className="bg-bg rounded-lg border border-border overflow-hidden">
            <div className="p-4 rounded-t-lg border-b bg-bg border-border">
              <div className="flex items-center gap-2 font-semibold text-sm text-fg">
                Data Pengguna
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted border-border">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg w-10">
                      {canDeleteUsers && (
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            setSelectedUser(
                              e.target.checked ? usersData.data.map((u) => String(u.id)) : [],
                            );
                          }}
                          checked={allSelected}
                          className="rounded border-border text-primary focus:ring-ring"
                        />
                      )}
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg w-10">
                      No
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Pengguna
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Group Akses
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg"></th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-bg divide-border">
                  {usersData.data.map((user, i) => (
                    <tr key={user.id} className="hover:bg-muted transition-colors">
                      <td className="whitespace-nowrap p-4 align-middle">
                        {canDeleteUsers && (
                          <input
                            type="checkbox"
                            value={user.id}
                            onChange={handleSelectUser}
                            checked={selectedUser.includes(String(user.id))}
                            className="rounded border-border text-primary focus:ring-ring"
                          />
                        )}
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle text-center text-muted-fg">
                        {i + 1 + (usersData.current_page - 1) * usersData.per_page}
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-fg">{user.name}</p>
                            <p className="text-xs text-muted-fg">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning rounded-full"
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div className="flex gap-2">
                          {canUpdateUsers && (
                            <Link
                              href={users.edit.url({ user: user.id })}
                              className="inline-flex items-center gap-1 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-warning/20"
                            >
                              <IconPencilCog size={16} strokeWidth={1.5} />
                            </Link>
                          )}
                          {canDeleteUsers && (
                            <button
                              onClick={() => deleteData(user.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
                            >
                              <IconTrash size={16} strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <EmptyState
          title="Belum Ada Pengguna"
          description="Tambahkan pengguna pertama Anda."
          icon={<IconUser size={32} className="text-muted-fg" strokeWidth={1.5} />}
          action={
            canCreateUsers ? (
              <Link
                href={users.create.url()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <IconCirclePlus size={18} />
                Tambah Pengguna
              </Link>
            ) : undefined
          }
        />
      )}

      <Pagination links={usersData.links} />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
