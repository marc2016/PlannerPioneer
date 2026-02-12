import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/useProjectStore';
import { useNavigate } from 'react-router-dom';

export const RecentProjects = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projects, init: initProjects } = useProjectStore();

    useEffect(() => {
        initProjects();
    }, [initProjects]);

    // Sort projects by updated_at (descending) and take top 5
    // Note: Project interface in store might need updated_at, checking usage
    // defined in create/update but not explicitly in interface shown in view_file, 
    // but DB schema usually has it. The addProject/updateProject methods set it.
    // Let's assume the store returns it or we fallback to createdAt.

    const recentProjects = [...projects].sort((a, b) => {
        const timeA = a.updatedAt || a.createdAt || 0;
        const timeB = b.updatedAt || b.createdAt || 0;
        return timeB - timeA;
    }).slice(0, 5);

    if (recentProjects.length === 0) {
        return null;
    }

    return (
        <div className="recent-projects">
            <h3>{t('dashboard.recent_projects')}</h3>
            <div className="project-list" style={{ display: 'grid', gap: '0.5rem' }}>
                {recentProjects.map(project => (
                    <div
                        key={project.id}
                        className="project-item"
                        onClick={() => navigate('/projects')} // Ideally filter or highlight, but simple nav for now
                        style={{
                            padding: '1rem',
                            // backgroundColor: 'var(--card-bg)',
                            borderRadius: 'var(--border-radius)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            borderLeft: `4px solid ${project.color || 'var(--primary-color)'}`
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>{project.title}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                {project.moduleCount} {t('projects.module_count')}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                            {new Date(project.createdAt || 0).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
