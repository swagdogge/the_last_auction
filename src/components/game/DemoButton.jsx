export default function DemoButton({ onStart }) {
  return (
    <button
      type="button"
      onClick={onStart}
      title="Presentation demo: pick six finished works with recorded reactions."
      className="btn-game btn-game-ghost px-8 py-4 text-[13px]"
    >
      Demo mode
    </button>
  );
}