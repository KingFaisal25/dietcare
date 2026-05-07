import Link from "next/link";
import { Button } from "@/components/ui/Button";

const programs = [
  {
    id: 1,
    name: "Simpel",
    price: 150000,
    duration: "14 Hari",
    features: ["Konsultasi Awal", "Meal Plan 14 Hari", "Evaluasi Akhir"],
    isPopular: false,
  },
  {
    id: 2,
    name: "Intensif",
    price: 250000,
    duration: "30 Hari",
    features: [
      "Konsultasi Awal",
      "Meal Plan 30 Hari",
      "Tanya Jawab via WA 30 Hari",
      "Evaluasi Mingguan",
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "Intensif+",
    price: 450000,
    duration: "60 Hari",
    features: [
      "Konsultasi Awal",
      "Meal Plan 60 Hari",
      "Tanya Jawab via WA 60 Hari",
      "Evaluasi Mingguan",
      "Penyesuaian Meal Plan",
    ],
    isPopular: false,
  },
];

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ProgramPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Pilih Program Diet Anda
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Dapatkan panduan gizi personal dari ahli gizi profesional untuk mencapai target kesehatan Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {programs.map((program) => (
          <div
            key={program.id}
            className={`relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border ${
              program.isPopular
                ? "border-green-500 shadow-green-100 dark:shadow-none"
                : "border-gray-200 dark:border-gray-800"
            } p-8`}
          >
            {program.isPopular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-green-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Terpopuler
                </span>
              </div>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {program.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  Rp {program.price.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Durasi: {program.duration}
              </p>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {program.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={`/checkout?program_id=${program.id}`} passHref>
              <Button
                variant={program.isPopular ? "primary" : "outline"}
                className="w-full justify-center"
              >
                Pilih Program
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Masih bingung memilih program yang tepat?
        </p>
        <a
          href="https://wa.me/6281234567890?text=Halo%20Admin%20DietCare%20,%20saya%20ingin%20bertanya%20tentang%20program%20diet"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.88-.653-1.474-1.46-1.647-1.757-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Tanya dulu via WhatsApp sebelum beli
        </a>
      </div>
    </div>
  );
}
