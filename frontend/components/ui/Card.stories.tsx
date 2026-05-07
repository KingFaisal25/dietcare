import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Design System/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Dashboard Ringkas</CardTitle>
        <CardDescription>Ringkasan progres dan aktivitas harian pengguna.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl bg-brand-50 p-4 text-sm text-neutral-700 dark:bg-brand-500/10 dark:text-neutral-100">
          Konten kartu dengan elevasi ringan dan border halus.
        </div>
      </CardContent>
    </Card>
  ),
};

export const Glass: Story = {
  render: () => (
    <Card variant="glass" className="w-[320px]">
      <CardHeader>
        <CardTitle>Glass Surface</CardTitle>
        <CardDescription>Cocok untuk hero metric dan panel ringkas.</CardDescription>
      </CardHeader>
      <CardContent>Desain semi-transparan dengan blur ringan.</CardContent>
    </Card>
  ),
};
