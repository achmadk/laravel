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
      className={`group overflow-hidden rounded-2xl border-2 bg-bg transition-all duration-200 hover:border-primary hover:shadow-lg ${
        isSelected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70 font-bold text-lg text-white">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base text-fg">{user.name}</h3>
            <p className="flex items-center gap-1 text-muted-fg text-sm">
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
              className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs"
            >
              <IconShield size={12} />
              {role.name}
            </span>
          ))}
        </div>
      </div>

      {(canUpdate || canDelete) && (
        <div className="flex border-border border-t">
          {canUpdate && (
            <Link
              href={users.edit.url({ user: user.id })}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 font-medium text-sm text-warning transition-colors hover:bg-warning/5"
            >
              <IconPencilCog size={16} />
              <span>Edit</span>
            </Link>
          )}
          {canUpdate && canDelete && <div className="w-px bg-border" />}
          {canDelete && (
            <button
              onClick={() => onDelete(user.id)}
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
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-bold text-2xl text-fg">Pengguna</h1>
            <p className="text-muted-fg text-sm">
              {usersData.total || usersData.data?.length || 0} pengguna terdaftar
            </p>
          </div>
          <div className="flex gap-2">
            {canDeleteUsers && selectedUser.length > 0 && (
              <button
                onClick={() => selectedUser.forEach((user) => deleteData(user))}
                className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-danger/90"
              >
                <IconTrash size={18} />
                Hapus {selectedUser.length}
              </button>
            )}
            {canCreateUsers && (
              <Link
                href={users.create.url()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
              >
                <IconCirclePlus size={18} strokeWidth={1.5} />
                Tambah Pengguna
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              name="search"
              placeholder="Cari pengguna..."
              className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
            />
          </form>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2.5 transition-colors ${
              viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-fg hover:bg-muted"
            }`}
          >
            <IconLayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg p-2.5 transition-colors ${
              viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-fg hover:bg-muted"
            }`}
          >
            <IconList size={20} />
          </button>
        </div>
      </div>

      {usersData.data.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="overflow-hidden rounded-lg border border-border bg-bg">
            <div className="rounded-t-lg border-border border-b bg-bg p-4">
              <div className="flex items-center gap-2 font-semibold text-fg text-sm">
                Data Pengguna
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-border border-b bg-muted">
                  <tr>
                    <th className="h-12 w-10 px-4 text-left align-middle font-medium text-muted-fg">
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
                    <th className="h-12 w-10 px-4 text-left align-middle font-medium text-muted-fg">
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
                <tbody className="divide-y divide-border bg-bg">
                  {usersData.data.map((user, i) => (
                    <tr key={user.id} className="transition-colors hover:bg-muted">
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
                      <td className="whitespace-nowrap p-4 text-center align-middle text-muted-fg">
                        {i + 1 + (usersData.current_page - 1) * usersData.per_page}
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/70 font-bold text-sm text-white">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-fg text-sm">{user.name}</p>
                            <p className="text-muted-fg text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs"
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
                              className="inline-flex items-center gap-1 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 font-medium text-warning text-xs transition-colors hover:bg-warning/20"
                            >
                              <IconPencilCog size={16} strokeWidth={1.5} />
                            </Link>
                          )}
                          {canDeleteUsers && (
                            <button
                              onClick={() => deleteData(user.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 font-medium text-danger text-xs transition-colors hover:bg-danger/20"
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
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-primary/90"
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
