import { Box, Typography, Fab, Paper, FormControl, Select, MenuItem, Divider } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import { useModuleStore, Module } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import ModuleCard from "../components/ModuleCard";
import ModuleDrawer from "../components/ModuleDrawer";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { spring } from "../constants";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);


import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Modules() {
    const { modules, init, deleteModule, toggleModule } = useModuleStore();
    const { projects, init: initProjects } = useProjectStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');

    const filteredModules = modules.filter(m => {
        // Status filter
        if (statusFilter === 'active' && m.completed) return false;
        if (statusFilter === 'completed' && !m.completed) return false;

        // Project filter
        if (projectFilter !== 'all') {
            if (projectFilter === 'unassigned') {
                if (m.project_id) return false;
            } else {
                if (m.project_id !== projectFilter) return false;
            }
        }

        return true;
    });

    const activeModules = filteredModules.filter(m => !m.completed);
    const completedModules = filteredModules.filter(m => m.completed);
    const { t } = useTranslation();
    const location = useLocation();

    useEffect(() => {
        init();
        initProjects();

        // Check for projectId in query params
        const params = new URLSearchParams(location.search);
        const projectId = params.get('projectId');
        if (projectId) {
            setProjectFilter(projectId);
        }
    }, [init, initProjects, location.search]);

    const handleAddClick = () => {
        setSelectedModule(null);
        setDrawerOpen(true);
    };

    const handleCardClick = (module: Module) => {
        setSelectedModule(module);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedModule(null);
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
                        {t('modules.title', "Modules")}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
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
                                <MenuItem value="all">{t('filters.all_projects', "Alle Projekte")}</MenuItem>
                                <MenuItem value="unassigned">{t('filters.no_project', "Kein Projekt")}</MenuItem>
                                <Divider />
                                {projects.map((project) => (
                                    <MenuItem key={project.id} value={project.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: project.color }} />
                                            {project.title}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
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
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('modules.total', "Total:")} <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>{modules.length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('modules.active', "Active:")} <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>{modules.filter(m => !m.completed).length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('modules.completed', "Completed:")} <Box component="span" sx={{ fontWeight: 500, color: 'success.main' }}>{modules.filter(m => m.completed).length}</Box>
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
                        {activeModules.map((module) => (
                            <MotionBox
                                key={module.id}
                                layoutId={module.id}
                                layout
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={spring}
                                sx={{ maxWidth: 280, width: '100%', mx: 'auto' }}
                            >
                                <ModuleCard
                                    module={module}
                                    onClick={handleCardClick}
                                    onDelete={deleteModule}
                                    onToggle={toggleModule}
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
                            {t('modules.completed_title', "Completed Modules")}
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
                        {completedModules.map((module) => (
                            <MotionBox
                                key={module.id}
                                layoutId={module.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                sx={{ maxWidth: 280, width: '100%', mx: 'auto' }}
                            >
                                <ModuleCard
                                    module={module}
                                    onClick={handleCardClick}
                                    onDelete={deleteModule}
                                    onToggle={toggleModule}
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

            <ModuleDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                module={selectedModule}
                initialProjectId={projectFilter}
            />
        </Box>
    );
}
