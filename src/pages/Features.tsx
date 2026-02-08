import { Box, Typography, Fab, Paper, FormControl, Select, MenuItem, Divider } from "@mui/material";
import { useLocation } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState, useMemo } from "react";
import { useFeatureStore, Feature } from "../store/useFeatureStore";
import { useModuleStore } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import FeatureCard from "../components/FeatureCard";
import FeatureDrawer from "../components/FeatureDrawer";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { spring } from "../constants";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);


import { useTranslation } from "react-i18next";

export default function Features() {
    const { features, init, deleteFeature, toggleFeature } = useFeatureStore();
    const { modules, init: initModules } = useModuleStore();
    const { projects, init: initProjects } = useProjectStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [moduleFilter, setModuleFilter] = useState<string>('all');

    // Filter available modules based on selected project
    const availableModules = useMemo(() => {
        if (projectFilter === 'all') return modules;
        if (projectFilter === 'unassigned') return modules.filter(m => !m.project_id);
        return modules.filter(m => m.project_id === projectFilter);
    }, [modules, projectFilter]);

    const filteredFeatures = features.filter(f => {
        // Status filter
        if (statusFilter === 'active' && f.completed) return false;
        if (statusFilter === 'completed' && !f.completed) return false;

        // Module filter
        if (moduleFilter !== 'all') {
            if (moduleFilter === 'unassigned') {
                if (f.module_id) return false;
            } else {
                if (f.module_id !== moduleFilter) return false;
            }
        }

        // Project filter (via module)
        if (projectFilter !== 'all') {
            if (!f.module_id) {
                // If feature has no module, it can only match if looking for 'unassigned' project?
                // Or if checking explicitly for unassigned project features.
                if (projectFilter !== 'unassigned') return false;
                // If projectFilter IS 'unassigned', we keep it (as it's not in any project)
            } else {
                const module = modules.find(m => m.id === f.module_id);
                if (!module) return false; // Should exist if ID exists

                if (projectFilter === 'unassigned') {
                    if (module.project_id) return false;
                } else {
                    if (module.project_id !== projectFilter) return false;
                }
            }
        }

        return true;
    });

    const activeFeatures = filteredFeatures.filter(f => !f.completed);
    const completedFeatures = filteredFeatures.filter(f => f.completed);
    const { t } = useTranslation();

    const location = useLocation();

    useEffect(() => {
        init();
        initModules();
        initProjects();

        const params = new URLSearchParams(location.search);
        const moduleId = params.get('moduleId');
        if (moduleId) {
            setModuleFilter(moduleId);
        }
    }, [init, initModules, initProjects, location.search]);

    const handleAddClick = () => {
        setSelectedFeature(null);
        setDrawerOpen(true);
    };

    const handleCardClick = (feature: Feature) => {
        setSelectedFeature(feature);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedFeature(null);
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
                        {t('features.title', "Features")}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Project Filter */}
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={projectFilter}
                                onChange={(e) => {
                                    setProjectFilter(e.target.value);
                                    setModuleFilter('all'); // Reset module filter when project changes
                                }}
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

                        {/* Module Filter */}
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
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
                                <MenuItem value="all">{t('filters.all_modules', "Alle Module")}</MenuItem>
                                <MenuItem value="unassigned">{t('filters.no_module', "Kein Modul")}</MenuItem>
                                <Divider />
                                {availableModules.map((module) => {
                                    const project = projects.find(p => p.id === module.project_id);
                                    return (
                                        <MenuItem key={module.id} value={module.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: module.color }} />
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                                                        {module.title}
                                                    </Typography>
                                                    {project && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                                                            {project.title}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        {/* Status Filter */}
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
                            {t('features.total', "Total:")} <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>{features.length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('features.active', "Active:")} <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>{features.filter(f => !f.completed).length}</Box>
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                            {t('features.completed', "Completed:")} <Box component="span" sx={{ fontWeight: 500, color: 'success.main' }}>{features.filter(f => f.completed).length}</Box>
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
                        {activeFeatures.map((feature) => (
                            <MotionBox
                                key={feature.id}
                                layoutId={feature.id}
                                layout
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={spring}
                                sx={{ maxWidth: 280, width: '100%', mx: 'auto' }}
                            >
                                <FeatureCard
                                    feature={feature}
                                    onClick={handleCardClick}
                                    onDelete={deleteFeature}
                                    onToggle={toggleFeature}
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
                            {t('features.completed_title', "Completed Features")}
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
                        {completedFeatures.map((feature) => (
                            <MotionBox
                                key={feature.id}
                                layoutId={feature.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                sx={{ maxWidth: 280, width: '100%', mx: 'auto' }}
                            >
                                <FeatureCard
                                    feature={feature}
                                    onClick={handleCardClick}
                                    onDelete={deleteFeature}
                                    onToggle={toggleFeature}
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

            <FeatureDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                feature={selectedFeature}
            />
        </Box>
    );
}
