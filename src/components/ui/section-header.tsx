import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
};

export function SectionHeader({ icon: Icon, title, action }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-secondary text-gold">
          <Icon className="size-4" aria-hidden />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {action ?? null}
    </div>
  );
}