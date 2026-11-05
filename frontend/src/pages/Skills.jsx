import useContent from '../hooks/useContent'
import usePageMeta from '../hooks/usePageMeta'
import skillsJson from '../data/skills.json'

export default function Skills() {
  usePageMeta('Skills', 'Technical skills across programming, web, databases, AI/data, tools and healthcare standards.')
  const { data: skills } = useContent('skills', skillsJson)

  return (
    <div className="section">
      <h1 className="text-3xl font-bold mb-2">Technical Skills</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-10">Grouped by area, with no made-up proficiency percentages.</p>
      <div className="grid sm:grid-cols-2 gap-6">
        {skills.map((group) => (
          <section key={group.id ?? group.category} className="card p-6 animate-slideUp">
            <h2 className="font-semibold text-lg mb-4">{group.category}</h2>
            <div className="flex flex-wrap gap-2">
              {(group.items || []).map((item) => (
                <span key={item} className="text-sm px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">{item}</span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
