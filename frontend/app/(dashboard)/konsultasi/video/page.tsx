"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, MonitorPlay, PhoneOff, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import VideoCall from "@/components/VideoCall";
import api from "@/lib/api";

interface ConsultationDetail {
  id: number;
  client: { id: number; name: string };
  nutritionist: { id: number; name: string; avatar_url: string };
  type: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number | null;
  notes: string | null;
}

function getFallback(): ConsultationDetail {
  return {
    id: 1,
    client: { id: 1, name: "Klien DietCare" },
    nutritionist: {
      id: 10,
      name: " Nurhaliza, S.Gz",
      avatar_url: "https://ui-avatars.com/api/?name=+Nurhaliza&background=e8f8f0&color=0d6e42",
    },
    type: "video_call",
    status: "scheduled",
    scheduled_at: new Date(Date.now() + 60000).toISOString(),
    duration_minutes: 30,
    notes: "Evaluasi progress minggu kedua.",
  };
}

function VideoCallPageContent() {
  const searchParams = useSearchParams();
  const consultationId = searchParams.get("id") ?? "1";
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const { data } = useQuery<ConsultationDetail>({
    queryKey: ["consultation-detail", consultationId],
    queryFn: async () => {
      try {
        const response = await api.get(`/consultations/${consultationId}`);
        return response.data.data as ConsultationDetail;
      } catch {
        return getFallback();
      }
    },
  });

  const detail = useMemo(() => data ?? getFallback(), [data]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      try {
        await api.put(`/consultations/${detail.id}/complete`);
      } catch {
        // Silently continue — backend may not be running
      }
    },
  });

  const roomName = `dietcare-${detail.client.id}-${detail.nutritionist.id}`;

  const handleCallEnd = useCallback(() => {
    setCallStarted(false);
    setCallEnded(true);
    completeMutation.mutate();
  }, [completeMutation]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/konsultasi"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke konsultasi
      </Link>

      {!callStarted && !callEnded && (
        <Card className="border-gray-100">
          <CardContent className="flex flex-col items-center gap-6 p-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50">
              <VideoIcon className="h-10 w-10 text-sky-600" />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Video Call Konsultasi</h1>
              <p className="mt-2 text-sm text-gray-500">
                Sesi video call bertatap muka dengan ahli gizi Anda.
              </p>
            </div>

            <div className="w-full max-w-md space-y-4 rounded-3xl bg-gray-50 p-6">
              <div className="flex items-center gap-4">
                <Image
                  src={detail.nutritionist.avatar_url}
                  alt={detail.nutritionist.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-50"
                />
                <div>
                  <p className="font-semibold text-gray-900">{detail.nutritionist.name}</p>
                  <p className="text-sm text-gray-500">Ahli Gizi Pendamping</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarClock className="h-4 w-4 text-gray-400" />
                  {new Date(detail.scheduled_at).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MonitorPlay className="h-4 w-4 text-gray-400" />
                  Durasi ±{detail.duration_minutes ?? 30} menit
                </div>
              </div>
              {detail.notes && (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-600">
                  {detail.notes}
                </p>
              )}
            </div>

            <Button
              onClick={() => setCallStarted(true)}
              className="w-full max-w-md gap-3 rounded-3xl bg-sky-600 py-5 text-lg font-bold hover:bg-sky-700"
            >
              <VideoIcon className="h-5 w-5" />
              Mulai Video Call
            </Button>
          </CardContent>
        </Card>
      )}

      {callStarted && (
        <VideoCall
          roomName={roomName}
          displayName={detail.client.name}
          onCallEnd={handleCallEnd}
        />
      )}

      {callEnded && (
        <Card className="border-gray-100">
          <CardContent className="flex flex-col items-center gap-6 p-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">
              <PhoneOff className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Sesi Selesai</h2>
              <p className="mt-2 text-sm text-gray-500">
                Video call telah berakhir. Status konsultasi diperbarui otomatis.
              </p>
            </div>
            <Link href="/konsultasi">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                Kembali ke Konsultasi
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function VideoCallPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-sm text-gray-500">Memuat sesi konsultasi...</div>}>
      <VideoCallPageContent />
    </Suspense>
  );
}
