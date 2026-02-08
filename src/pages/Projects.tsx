import { Box, Typography, Fab, Paper, FormControl, Select, MenuItem } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import { useProjectStore, Project } from "../store/useProjectStore";
import ProjectCard from "../components/ProjectCard";
import ProjectDrawer from "../components/ProjectDrawer";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { spring } from "../constants";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);


import { useTranslation } from "react-i18next";
//...
export default function Projects() {
    const { projects, init, deleteProject, toggleProject } = useProjectStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

    // Filter projects based on status
    const filteredProjects = projects.filter(p => {
        if (statusFilter === 'active') return !p.completed;
        if (statusFilter === 'completed') return p.completed;
        return true;
    });

    const activeProjects = filteredProjects.filter(p => !p.completed);
    const completedProjects = filteredProjects.filter(p => p.completed);

    const { t } = useTranslation();

    useEffect(() => {
        init();
    }, [init]);

    const handleAddClick = () => {
        setSelectedProject(null);
        setDrawerOpen(true);
    };

    const handleCardClick = (project: Project) => {
        setSelectedProject(project);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedProject(null);
    };

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.30)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 4
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary' }}>
                        {t('projects.title')}
                    </Typography>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
                            displayEmpty
                            variant="outlined"
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            <MenuItem value="all">{t('filters.all', "Alle")}</MenuItem>
                            <MenuItem value="active">{t('filters.active', "Aktiv")}</MenuItem>
                            <MenuItem value="completed">{t('filters.completed', "Abgeschlossen")}</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('projects.total')} <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>{projects.length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('projects.active')} <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>{projects.filter(p => !p.completed).length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('projects.completed')} <Box component="span" sx={{ fontWeight: 500, color: 'success.main' }}>{projects.filter(p => p.completed).length}</Box>
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <LayoutGroup>

                <MotionBox
                    layout
                    transition={spring}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {activeProjects.map((project) => (
                            <MotionBox
                                key={project.id}
                                layoutId={project.id}
                                layout
                                //initial={{ opacity: 0 }}
                                //animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={spring}
                                sx={{ maxWidth: 280, width: '100%', mx: 'auto' }}
                            >
                                <ProjectCard
                                    project={project}
                                    onClick={handleCardClick}
                                    onDelete={deleteProject}
                                    onToggle={toggleProject}
                                />
                            </MotionBox>
                        ))}
                    </AnimatePresence>
                </MotionBox>

                <MotionPaper
                    layout
                    transition={spring}
                    elevation={0}
                    sx={{
                        my: 4,
                        p: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.30)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 4
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary' }}>
                            {t('projects.completed_title')}
                        </Typography>
                    </Box>
                </MotionPaper>

                <MotionBox
                    layout
                    transition={spring}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {completedProjects.map((project) => (
                            <MotionBox
                                key={project.id}
                                layoutId={project.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                sx={{ maxWidth: 280, width: '100%', mx: 'auto' }}
                            >
                                <ProjectCard
                                    project={project}
                                    onClick={handleCardClick}
                                    onDelete={deleteProject}
                                    onToggle={toggleProject}
                                />
                            </MotionBox>
                        ))}
                    </AnimatePresence>
                </MotionBox>


            </LayoutGroup>
            <Fab
                aria-label="add"
                sx={{
                    position: 'fixed', bottom: 32, right: 32, bgcolor: 'white',
                    color: 'black',
                    '&:hover': {
                        bgcolor: '#f5f5f5' // slightly grey on hover
                    }
                }}
                onClick={handleAddClick}
            >
                <AddIcon />
            </Fab>

            <ProjectDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                project={selectedProject}
            />
        </Box>
    );
}
