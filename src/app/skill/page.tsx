import { notFound } from 'next/navigation';
import { SKILLS } from '@/content/skills';

export default async function SkillPage({ params }: { params: { id: string } }) {
  const skill = SKILLS.find(s => s.id === params.id);
  if (!skill) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">{skill.title}</h1>
        <p className="text-sm text-muted-foreground">Grade {skill.grade}</p>
        <p className="mt-2">
          Coming soon: the actual practice player for <span className="font-medium">{skill.title}</span>.
        </p>
      </div>
    </div>
  );
}
