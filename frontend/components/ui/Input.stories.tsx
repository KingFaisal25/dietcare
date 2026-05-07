import type { Meta, StoryObj } from "@storybook/react";
import { FiMail } from "react-icons/fi";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Design System/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Email",
    placeholder: "nama@email.com",
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    icon: <FiMail />,
  },
};

export const Error: Story = {
  args: {
    error: "Email wajib diisi",
    value: "salma@",
  },
};
