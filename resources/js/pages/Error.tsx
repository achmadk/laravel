import { Head, usePage } from "@inertiajs/react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import {
  IconLock,
  IconHelpOctagon,
  IconBrowserOff,
  IconServerOff,
  IconClock,
} from "@tabler/icons-react";

interface ErrorPageProps {
  status: number;
  homeUrl: string;
  homeLabel: string;
}

const errorContent: Record<
  number,
  { title: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  401: {
    title: "Tidak Diotorisasi",
    description: "Anda tidak memiliki akses ke halaman ini.",
    icon: IconLock,
  },
  403: {
    title: "Akses Ditolak",
    description: "Anda tidak memiliki izin untuk mengakses halaman tersebut.",
    icon: IconLock,
  },
  404: {
    title: "Halaman Tidak Ditemukan",
    description: "Halaman yang Anda cari tidak ditemukan.",
    icon: IconHelpOctagon,
  },
  419: {
    title: "Sesi Berakhir",
    description: "Sesi Anda telah berakhir. Silakan refresh halaman.",
    icon: IconClock,
  },
  429: {
    title: "Terlalu Banyak Permintaan",
    description: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
    icon: IconBrowserOff,
  },
  500: {
    title: "Kesalahan Server",
    description: "Terjadi kesalahan pada server. Silakan coba lagi.",
    icon: IconServerOff,
  },
  503: {
    title: "Layanan Tidak Tersedia",
    description: "Layanan sedang dalam pemeliharaan. Silakan coba lagi.",
    icon: IconServerOff,
  },
};

// oxlint-disable-next-line typescript/no-redundant-type-constituents
export default function ErrorPage({ status = 500 }: ErrorPageProps | any) {
  const page = usePage<any>();
  const resolvedStatus = status || page.props?.status || 500;
  const content = errorContent[resolvedStatus] || errorContent[500];
  const homeUrl = page.props?.homeUrl || "/";
  const homeLabel = page.props?.homeLabel || "Kembali ke Beranda";
  const Icon = content.icon;

  return (
    <>
      <Head title={`${resolvedStatus} - ${content.title}`} />
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="mb-6 rounded-full bg-muted p-6">
            <Icon className="size-16 text-muted-fg" />
          </div>
          <h1 className="text-6xl font-bold text-fg">{resolvedStatus}</h1>
          <h2 className="mt-4 text-xl font-semibold text-fg">{content.title}</h2>
          <p className="mt-2 text-muted-fg">{content.description}</p>
          <Link href={homeUrl} className="mt-8">
            <Button>{homeLabel}</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
