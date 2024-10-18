import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-8">
      <p className="mb-4">
        You are now in the home page of the mcsr-ranked widget.
      </p>
      <p className="mb-4">
        If you want to generate a widget, click on the link:{" "}
        <Link className="text-blue-500 underline" href="/generator">
        /generator
        </Link>
      </p>
      <p className="mb-4">
        Documentation is available at <a href="https://github.com/cltWilly/mcsrr-widget" className="text-blue-500 underline">GitHub</a>.
      </p>
      <p>
        This project is using the mcsr-ranked API and it is not affiliated with Mojang Studios or Microsoft.
      </p>
    </div>
  );
}