// The working canvas mounted on a crude wooden easel, built from the same flat
// blocks as the room behind it, so the painting belongs to the studio instead of
// floating in front of it.
export default function Easel({ children }) {
  return (
    <div className="mx-auto w-full max-w-[430px] select-none">
      <div className="border-[3px] border-[#f7f7f2] bg-[#f7f2e6]">
        {children}
      </div>

      {/* the easel's ledge */}
      <div className="mx-auto h-2.5 w-[106%] -translate-x-[3%] bg-[#8a6a44]" />
      <div className="mx-auto h-1 w-[106%] -translate-x-[3%] bg-[#6b4d36]" />

      {/* legs, a little crooked */}
      <div className="relative h-16">
        <div className="absolute left-6 top-0 h-16 w-2 origin-top rotate-[7deg] bg-[#7a5a3f]" />
        <div className="absolute right-6 top-0 h-16 w-2 origin-top -rotate-[7deg] bg-[#7a5a3f]" />
        <div className="absolute left-1/2 top-0 h-14 w-1.5 -translate-x-1/2 bg-[#6b4d36]" />
      </div>
    </div>
  );
}