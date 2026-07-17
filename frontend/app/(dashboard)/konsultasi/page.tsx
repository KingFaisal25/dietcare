"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  MessageCircleMore,
  Phone,
  Star,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ChatWindow from "@/components/ChatWindow";
import api from "@/lib/api";
import { getChatRoomId } from "@/lib/hooks/useChat";
import { getWaLink } from "@/lib/wa";
import { gsap } from "gsap";

interface KonsultasiData {
  client: {
    id: number;
    name: string;
  };
  nutritionist: {
    id: number;
    name: string;
    avatarUrl: string;
    phone: string;
    program: string;
    rating: number | null;
    reviewCount: number;
  };
  consultations: Array<{
    id: number;
    type: string;
    status: string;
    scheduledAt: string;
    durationMinutes: number | null;
    notes: string | null;
  }>;
}

function getFallbackData(): KonsultasiData {
  return {
    client: { id: 1, name: "Klien DietCare" },
    nutritionist: {
      id: 10,
      name: " Nurhaliza, S.Gz",
      avatarUrl: "https://ui-avatars.com/api/?name=+Nurhaliza&background=e8f8f0&color=0d6e42",
      phone: "6281234567890",
      program: "Fat Loss 60 Hari",
      rating: 4.9,
      reviewCount: 27,
    },
    consultations: [
      {
        id: 1,
        type: "video_call",
        status: "scheduled",
        scheduledAt: "2026-03-31T09:00:00.000Z",
        durationMinutes: 30,
        notes: "Evaluasi hasil minggu kedua dan update target langkah harian.",
      },
      {
        id: 2,
        type: "chat",
        status: "completed",
        scheduledAt: "2026-03-25T12:30:00.000Z",
        durationMinutes: 15,
        notes: "Diskusi pengganti menu snack sore.",
      },
    ],
  };
}

export default function KonsultasiPage() {
  const { data } = useQuery<KonsultasiData>({
    queryKey: ["konsultasi-data"],
    queryFn: async () => {
      try {
        const response = await api.get("/consultations/upcoming");
        const apiData = response.data.data as any;
        return {
          client: apiData.client,
          nutritionist: {
            ...apiData.nutritionist,
            avatarUrl: apiData.nutritionist.avatar_url,
            reviewCount: apiData.nutritionist.review_count,
          },
          consultations: apiData.consultations.map((c: any) => ({
            ...c,
            scheduledAt: c.scheduled_at,
            durationMinutes: c.duration_minutes,
          })),
        };
      } catch {
        return getFallbackData();
      }
    },
  });

  const konsultasi = useMemo(() => data ?? getFallbackData(), [data]);
  const { client, nutritionist } = konsultasi;
  const chatRoomId = getChatRoomId(String(client.id), String(nutritionist.id));

  const upcomingConsultation = konsultasi.consultations.find(
    (c) => c.status === "scheduled" || c.status === "confirmed"
  );

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (pageRef.current) {
      tl.from(pageRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });
    }
    if (headerRef.current) {
      tl.from(headerRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.3");
    }
    if (profileRef.current) {
      tl.from(profileRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.3");
    }
    if (chatRef.current) {
      tl.from(chatRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.3");
    }
    if (historyRef.current) {
      tl.from(historyRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.3");
    }
  }, []);

  return (
    <div
      ref={pageRef}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 bg-white min-h-screen"
    >
      <div
        ref={headerRef}
        className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
          <MessageCircleMore className="h-4 w-4" />
          Konsultasi Online
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Konsultasi Gizi</h1>
        <p className="mt-2 text-sm text-gray-500">
          Chat langsung dengan ahli gizi Anda, jadwalkan video call, atau lanjut via WhatsApp.
        </p>
      </div>

      <div
        ref={profileRef}
        className="mb-8 grid gap-6 lg:grid-cols-[1.4fr,1fr]"
      >
        <Card className="border-gray-100">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <Image
              src={nutritionist.avatarUrl}
              alt={nutritionist.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-3xl object-cover ring-2 ring-primary-100"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                Ahli Gizi Pendamping
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{nutritionist.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{nutritionist.program}</p>
              <div className="mt-3 flex items-center gap-2">
                {nutritionist.rating !== null && (
                  <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {nutritionist.rating.toFixed(1)}
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  {nutritionist.reviewCount} review
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <a
            href={getWaLink(
              `Halo kak ${nutritionist.name}, saya mau konsultasi lanjutan tentang program ${nutritionist.program}.`,
              nutritionist.phone
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 text-lg font-bold text-white shadow-lg shadow-primary-200 transition hover:from-primary-600 hover:to-primary-700"
          >
            <Phone className="h-5 w-5" />
            Chat via WhatsApp
          </a>

          <Link href="/konsultasi/jadwal">
            <Button
              variant="outline"
              className="w-full gap-3 rounded-3xl border-2 py-5 text-base font-semibold"
            >
              <CalendarClock className="h-5 w-5 text-primary-600" />
              Jadwalkan Video Call
            </Button>
          </Link>

          {upcomingConsultation && (
            <Link href={`/konsultasi/video?id=${upcomingConsultation.id}`}>
              <Button className="w-full gap-3 rounded-3xl bg-sky-600 py-5 text-base font-semibold hover:bg-sky-700">
                <Video className="h-5 w-5" />
                Masuk Video Call
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div ref={chatRef} className="mb-8">
        <ChatWindow
          chatRoomId={chatRoomId}
          currentUserId={String(client.id)}
          currentUserName={client.name}
          currentUserRole="client"
          partnerName={nutritionist.name}
          partnerAvatarUrl={nutritionist.avatarUrl}
          partnerPhone={nutritionist.phone}
        />
      </div>

      <div ref={historyRef}>
        <Card className="border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl">Riwayat Konsultasi</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 p-0">
            {konsultasi.consultations.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                Belum ada riwayat konsultasi.
              </div>
            ) : (
              konsultasi.consultations.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                          c.type === "video_call"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-primary-50 text-primary-700"
                        }`}
                      >
                        {c.type === "video_call" ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <MessageCircleMore className="h-3 w-3" />
                        )}
                        {c.type === "video_call" ? "Video Call" : "Chat"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          c.status === "completed"
                            ? "bg-gray-100 text-gray-600"
                            : c.status === "scheduled"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-primary-50 text-primary-700"
                        }`}
                      >
                        {c.status === "completed"
                          ? "Selesai"
                          : c.status === "scheduled"
                          ? "Terjadwal"
                          : c.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {new Date(c.scheduledAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {c.notes && <p className="mt-1 text-sm text-gray-500">{c.notes}</p>}
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                    {c.durationMinutes ?? 0} menit
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
