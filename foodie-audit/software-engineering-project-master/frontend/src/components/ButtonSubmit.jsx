import { LoaderCircle, MoveRight } from "lucide-react";

export default function ButtonSubmit({ isPending, text }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="group w-full mt-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/80 cursor-pointer disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {isPending ? (
        <>
          <LoaderCircle size={20} className="animate-spin" />
        </>
      ) : (
        <>
          {text}
          <MoveRight
            size={20}
            className="group-hover:translate-x-2 transition-all duration-300"
          />
        </>
      )}
    </button>
  );
}
