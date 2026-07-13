interface ChoiceButtonProps {
  label: string;
  revealed: boolean;
  isAnswer: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function ChoiceButton({
  label,
  revealed,
  isAnswer,
  isSelected,
  onClick,
}: ChoiceButtonProps) {
  let style =
    "border-gold-dark bg-hextech-black/60 hover:border-gold hover:bg-deep-blue/60 cursor-pointer";
  if (revealed) {
    if (isAnswer) {
      style = "border-hextech-blue bg-deep-blue text-blue-light font-bold";
    } else if (isSelected) {
      style = "border-red-500/80 bg-red-950/40 text-red-200";
    } else {
      style = "border-gold-dark/40 bg-hextech-black/40 opacity-50";
    }
  }
  return (
    <button
      type="button"
      disabled={revealed}
      onClick={onClick}
      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${style}`}
    >
      <span className="flex items-center gap-2">
        {revealed && isAnswer && <span aria-hidden>✓</span>}
        {revealed && !isAnswer && isSelected && <span aria-hidden>✗</span>}
        {label}
      </span>
    </button>
  );
}
