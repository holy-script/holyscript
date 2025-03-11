import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="card">
          <div
            className="flex-1/3"
          >
            <Image
              src={"/professional-pic-no-bg.png"}
              alt="Professional Pic"
              width={300}
              height={300}
              className="rounded-3xl bg-[rgba(255,140,0,0.7)] border-[0.1px] border-solid border-[DarkOrange] shadow-[0_35px_65px_0_Chocolate,_inset_0_-10px_15px_0_DarkOrange] max-h-44 max-w-44"
            />
          </div>
          <div
            className="flex-2/3 p-4"
          >
            <p>Palash Johri</p>
            <p className="card-footer">Full Stack Developer</p>
          </div>
        </div>
        <div className="card mt-5 h-20">
          <p>
            Coming Soon...
          </p>
        </div>
      </main>
    </div>
  );
}
