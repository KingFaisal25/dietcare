"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarRange, CheckCircle2, Clock3, Flag, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";
import {
  getFallbackSchedule,
  type NutritionistAvailability,
  type NutritionistScheduleResponse,
} from "@/lib/nutritionistData";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function NutritionistSchedulePage() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const [availability, setAvailability] = useState<Record<number, NutritionistAvailability>>({});

  const { data, isLoading, refetch, isRefetching } = useQuery<NutritionistScheduleResponse>({
    queryKey: ["nutritionist-schedule", format(weekStart, "yyyy-MM-dd")],
    queryFn: async () => {
      try {
        const response = await api.get(`/nutritionist/schedule?week_start=${format(weekStart, "yyyy-MM-dd")}`);
        return response.data.data as NutritionistScheduleResponse;
      } catch {
        return getFallbackSchedule();
      }
    },
  });

  const schedule = useMemo(() => data ?? getFallbackSchedule(), [data]);

  useEffect(() => {
    const mappedAvailability = schedule.availability.reduce<Record<number, NutritionistAvailability>>(
      (accumulator, item) => {
        accumulator[item.weekday] = item.availability;
        return accumulator;
      },
      {}
    );

    setAvailability(mappedAvailability);
  }, [schedule.availability]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        availability: availability[weekday] ?? "active",
      }));

      try {
        await api.put("/nutritionist/schedule", {
          settings: payload,
        });
        return "Jadwal mingguan berhasil disimpan.";
      } catch {
        return "Jadwal tersimpan di tampilan lokal. Hubungkan backend agar sinkron permanen.";
      }
    },
    onSuccess: (message) => setFeedback(message),
  });

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(new Date(schedule.week_start), index);
        return {
          index,
          date,
          label: format(date, "EEEE", { locale: idLocale }),
          shortLabel: format(date, "dd MMM", { locale: idLocale }),
        };
      }),
    [schedule.week_start]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <CalendarRange className="h-4 w-4" />
              Kalender kerja ahli gizi
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Jadwal Konsultasi Mingguan</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Atur hari aktif, tandai slow response, dan pantau slot konsultasi yang sudah terisi.
            </p>
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              Periode {format(new Date(schedule.week_start), "d MMM", { locale: idLocale })} -{" "}
              {format(new Date(schedule.week_end), "d MMM yyyy", { locale: idLocale })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan Jadwal
            </Button>
          </div>
        </div>
      </div>

      {feedback ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {feedback}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <LegendCard
          icon={Sparkles}
          title="Hari aktif"
          description="Respons cepat dan bisa menerima booking penuh."
          accentClassName="bg-emerald-50 text-emerald-700"
        />
        <LegendCard
          icon={Clock3}
          title="Slow response"
          description="Masih menerima klien, tetapi respons lebih lambat dari biasanya."
          accentClassName="bg-amber-50 text-amber-700"
        />
        <LegendCard
          icon={Flag}
          title="Hari libur"
          description="Tidak menerima booking baru pada slot hari tersebut."
          accentClassName="bg-rose-50 text-rose-700"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-7">
        {days.map((day) => (
          <Card key={day.index} className="border-gray-100">
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="text-sm font-semibold capitalize text-gray-900">{day.label}</p>
                <p className="mt-1 text-xs text-gray-500">{day.shortLabel}</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setAvailability((current) => ({ ...current, [day.index]: "active" }))}
                  className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    availability[day.index] === "active"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability((current) => ({ ...current, [day.index]: "slow" }))}
                  className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    availability[day.index] === "slow"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  Slow response
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability((current) => ({ ...current, [day.index]: "off" }))}
                  className={`w-full rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                    availability[day.index] === "off"
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  Libur
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Kalender Slot Mingguan</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <div className="min-w-[1040px]">
              <div className="grid grid-cols-[120px_repeat(7,minmax(130px,1fr))] border-b border-gray-100 bg-gray-50">
                <div className="px-4 py-4 text-sm font-semibold text-gray-500">Jam</div>
                {days.map((day) => (
                  <div key={day.index} className="border-l border-gray-100 px-4 py-4">
                    <p className="text-sm font-semibold capitalize text-gray-900">{day.label}</p>
                    <p className="mt-1 text-xs text-gray-500">{day.shortLabel}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAvailabilityClass(availability[day.index] ?? "active")}`}>
                      {availability[day.index] ?? "active"}
                    </span>
                  </div>
                ))}
              </div>

              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="grid grid-cols-[120px_repeat(7,minmax(130px,1fr))] border-b border-gray-100 last:border-b-0"
                >
                  <div className="px-4 py-5 text-sm font-semibold text-gray-700">{time}</div>
                  {days.map((day) => {
                    const slot = schedule.booked_slots.find((item) => item.day_index === day.index && item.time === time);
                    const isOff = availability[day.index] === "off";

                    return (
                      <div key={`${day.index}-${time}`} className="border-l border-gray-100 px-3 py-3">
                        {slot ? (
                          <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
                            <p className="font-semibold">{slot.client_name}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-600">{formatConsultationType(slot.type)}</p>
                            <p className="mt-2 text-xs text-emerald-700">{slot.status}</p>
                          </div>
                        ) : (
                          <div
                            className={`rounded-2xl border border-dashed px-3 py-4 text-center text-xs font-medium ${
                              isOff
                                ? "border-rose-200 bg-rose-50 text-rose-500"
                                : availability[day.index] === "slow"
                                  ? "border-amber-200 bg-amber-50 text-amber-600"
                                  : "border-gray-200 bg-white text-gray-400"
                            }`}
                          >
                            {isOff ? "Libur" : availability[day.index] === "slow" ? "Slow response" : "Tersedia"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LegendCard({
  icon: Icon,
  title,
  description,
  accentClassName,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  accentClassName: string;
}) {
  return (
    <Card className="border-gray-100">
      <CardContent className="flex items-start gap-4 p-6">
        <div className={`rounded-2xl p-3 ${accentClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getAvailabilityClass(type: NutritionistAvailability) {
  if (type === "active") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (type === "slow") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
}

function formatConsultationType(type: string) {
  return type.replaceAll("_", " ");
}
