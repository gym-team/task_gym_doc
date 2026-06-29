import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import WeekViewer from "@/components/nutrition/week-view";

type WeekPageProps = {
  params: {
    enrollmentId: string;
    weekNumber: string;
  };
};

export default function WeekPage({ params }: WeekPageProps) {
  const enrollmentId = Number(params.enrollmentId);
  const weekNumber = Number(params.weekNumber);

  if (
    Number.isNaN(enrollmentId) ||
    Number.isNaN(weekNumber) ||
    enrollmentId <= 0 ||
    weekNumber <= 0
  ) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#050505]">
        <WeekViewer enrollmentId={enrollmentId} weekNumber={weekNumber} />
      </main>
    </>
  );
}