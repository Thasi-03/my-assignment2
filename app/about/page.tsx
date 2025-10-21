import ClientPathRemember from "../(utils)/client-path";

export default function About() {
  return (
    <section className="card">
      <ClientPathRemember />
      <h2>About</h2>
      <p><strong>Name:</strong> Thasigaran Sagadevan</p>
      <p><strong>Student ID:</strong> 21969946</p>
      <p>This app demonstrates a simple Escape Room game built in Next.js with React hooks.</p>
    </section>
  );
}
