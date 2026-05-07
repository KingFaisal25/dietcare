import type { Meta, StoryObj } from "@storybook/react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Mulai Konsultasi",
    variant: "primary",
    size: "md",
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Lihat Detail",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Bandingkan Paket",
  },
};

export const WithIcon: Story = {
  args: {
    icon: <FiArrowRight />,
    children: "Lanjutkan",
  },
};
