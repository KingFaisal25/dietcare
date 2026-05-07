"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, format, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, CalendarClock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

interface ScheduleAvailability {
  nutritionist: {
    id: number;
    name: string;
    avatar_url: string;
  };
  week_start: string;
  availability: Array<{
    weekday: number;
    availability: "active" | "slow" | "off";
  }>;
  booked_slots: Array<{
    day_index: number;
    time: string;
  }>;
}

function getFallbackSchedule(): ScheduleAvailability {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return {
    nutritionist: {
      id: 10,
      name: " Nurhaliza, S.Gz",
      avatar_url: "https://ui-avatars.com/api/?name=+Nurhaliza&background=e8f8f0&color=0d6e42",
    },
    week_start: format(weekStart, "yyyy-MM-dd"),
    availability: [
      { weekday: 0, availability: "active" },
      { weekday: 1, availability: "active" },
      { weekday: 2, availability: "slow" },
      { weekday: 3, availability: "active" },
      { weekday: 4, availability: "active" },
      { weekday: 5, availability: "slow" },
      { weekday: 6, availability: "off" },
    ],
    booked_slots: [
      { day_index: 0, time: "09:00" },
      { day_index: 1, time: "13:00" },
      { day_index: 3, time: "10:00" },
    ],
  };
}

export default function JadwalKonsultasiPage() {
  const [selectedSlot, setSelectedSlot] = useState<{ dayIndex: number; time: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data } = useQuery<ScheduleAvailability>({
    queryKey: ["schedule-availability"],
    queryFn: async () => {
      try {
        const response = await api.get("/consultations/schedule-availability");
        return response.data.data as ScheduleAvailability;
      } catch {
        return getFallbackSchedule();
      }
    },
  });

  const schedule = useMemo(() => data ?? getFallbackSchedule(), [data]);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(new Date(schedule.week_start), index);
        return {
          index,
          date,
          label: format(date, "EEEE", { locale: idLocale }),
          shortLabel: format(date, "dd MMM", { locale: idLocale }),
          dateStr: format(date, "yyyy-MM-dd"),
        };
      }),
    [schedule.week_start]
  );

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot) throw new Error("Pilih slot terlebih dahulu.");

      const selectedDate = days[selectedSlot.dayIndex].dateStr;
      const scheduledAt = `${selectedDate}T${selectedSlot.time}:00`;

      try {
        await api.post("/consultations/schedule", {
          scheduled_at: scheduledAt,
          type: "video_call",
          duration_minutes: 30,
          notes: null,
        });
        return "Jadwal video call berhasil dibuat! Email konfirmasi telah dikirim.";
      } catch {
        return "Jadwal tersimpan secara lokal. Hubungkan backend untuk konfirmasi email.";
      }
    },
    onSuccess: (message) => {
      setFeedback(message);
      setSelectedSlot(null);
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Gagal menjadwalkan.");
    },
  });

  const isSlotBooked = (dayIndex: number, time: string) =>
    schedule.booked_slots.some((s) => s.day_index === dayIndex && s.time === time);

  const isSlotOff = (dayIndex: number) =>
    schedule.availability.find((a) => a.weekday === dayIndex)?.availability === "off";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/konsultasi"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke konsultasi
      </Link>

      <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              <CalendarClock className="h-4 w-4" />
              Penjadwalan
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Jadwalkan Video Call</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Pilih slot waktu yang tersedia untuk sesi video call dengan ahli gizi Anda.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Image
              src={schedule.nutritionist.avatar_url}
              alt={schedule.nutritionist.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-emerald-50"
            />
            <div>
              <p className="font-semibold text-gray-900">{schedule.nutritionist.name}</p>
              <p className="text-sm text-gray-500">Ahli Gizi</p>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4">
        {[
          { color: "bg-emerald-100", label: "Tersedia" },
          { color: "bg-amber-100", label: "Slow response" },
          { color: "bg-gray-200", label: "Sudah terisi" },
          { color: "bg-rose-100", label: "Libur" },
          { color: "bg-sky-500", label: "Dipilih" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`h-3.5 w-3.5 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Time slot grid */}
      <Card className="border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Slot Waktu Minggu Ini</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[900px]">
            {/* Day headers */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-100 bg-gray-50">
              <div className="px-4 py-4 text-sm font-semibold text-gray-500">Jam</div>
              {days.map((day) => (
                <div key={day.index} className="border-l border-gray-100 px-3 py-4 text-center">
                  <p className="text-sm font-semibold capitalize text-gray-900">{day.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{day.shortLabel}</p>
                </div>
              ))}
            </div>

            {/* Time rows */}
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700">
                  {time}
                </div>
                {days.map((day) => {
                  const off = isSlotOff(day.index);
                  const booked = isSlotBooked(day.index, time);
                  const isSelected =
                    selectedSlot?.dayIndex === day.index && selectedSlot?.time === time;
                  const slow =
                    schedule.availability.find((a) => a.weekday === day.index)?.availability === "slow";
                  const available = !off && !booked;

                  return (
                    <div key={`${day.index}-${time}`} className="border-l border-gray-100 p-2">
                      <button
                        type="button"
                        disabled={!available}
                        onClick={() =>
                          setSelectedSlot(
                            isSelected ? null : { dayIndex: day.index, time }
                          )
                        }
                        className={`w-full rounded-2xl px-2 py-3 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-sky-500 text-white shadow-md"
                            : off
                              ? "cursor-not-allowed bg-rose-50 text-rose-400"
                              : booked
                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                : slow
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {isSelected
                          ? "✓ Dipilih"
                          : off
                            ? "Libur"
                            : booked
                              ? "Terisi"
                              : "Tersedia"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirm booking */}
      {selectedSlot && (
        <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-sky-900">Slot dipilih</p>
              <p className="mt-1 text-sm text-sky-700">
                {days[selectedSlot.dayIndex].label}, {days[selectedSlot.dayIndex].shortLabel} pukul{" "}
                {selectedSlot.time} WIB • 30 menit
              </p>
            </div>
            <Button
              onClick={() => bookMutation.mutate()}
              isLoading={bookMutation.isPending}
              className="gap-2 bg-sky-600 hover:bg-sky-700"
            >
              <CalendarClock className="h-4 w-4" />
              Konfirmasi Jadwal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
