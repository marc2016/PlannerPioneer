import { Box, Typography, Fab, Paper, FormControl, Select, MenuItem, Divider, TextField, InputAdornment, ToggleButton, ToggleButtonGroup } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { useEffect, useState } from "react";
import { useModuleStore, Module } from "../store/useModuleStore";
import { useProjectStore } from "../store/useProjectStore";
import ModuleCard from "../components/ModuleCard";
import ModuleDrawer from "../components/ModuleDrawer";
import { useSettingsStore } from "../store/useSettingsStore";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { spring } from "../constants";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);


import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Modules() {
    const { modules, init, deleteModule, toggleModule } = useModuleStore();
    const { projects, init: initProjects } = useProjectStore();
    const { selectedProjectId: projectFilter, setSelectedProjectId: setProjectFilter } = useSettingsStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'alpha' | 'duration' | 'tshirt'>('alpha');
    const [searchQuery, setSearchQuery] = useState('');

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

        // Search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesTitle = m.title.toLowerCase().includes(lowerQuery);
            const matchesDesc = m.description?.toLowerCase().includes(lowerQuery) ?? false;
            if (!matchesTitle && !matchesDesc) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortBy === 'alpha') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'duration') {
            const durA = a.totalDuration || 0;
            const durB = b.totalDuration || 0;
            return durB - durA;
        } else {
            // T-shirt size sorting
            const sizeOrder = { 'XL': 4, 'L': 3, 'M': 2, 'S': 1, undefined: 0 };
            const orderA = sizeOrder[a.tShirtSize as keyof typeof sizeOrder] || 0;
            const orderB = sizeOrder[b.tShirtSize as keyof typeof sizeOrder] || 0;
            if (orderA !== orderB) return orderB - orderA; // Larger first
            return a.title.localeCompare(b.title); // Secondary: Alpha
        }
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
                className="glass-paper"
                sx={{
                    mb: 4,
                    p: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary', mr: 2 }}>
                        {t('modules.title', "Modules")}
                    </Typography>

                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder={t('search', 'Suche...') as string}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            minWidth: 200
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

                        {/* Sort Toggle */}
                        <ToggleButtonGroup
                            value={sortBy}
                            exclusive
                            onChange={(_, newValue) => newValue !== null && setSortBy(newValue)}
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.5)',
                                borderRadius: 2,
                                '& .MuiToggleButton-root': {
                                    border: 'none',
                                    px: 2,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        }
                                    }
                                },
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            <ToggleButton value="alpha" title={t('sort.alphabetical', 'Alphabetisch')}>
                                <SortByAlphaIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="duration" title={t('sort.duration', 'Dauer')}>
                                <AccessTimeIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="tshirt" title={t('sort.tshirt', 'T-Shirt Größe')}>
                                <CheckroomIcon fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>
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
                </Box >
            </Paper >

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
                                sx={{ maxWidth: 280, width: '100%', height: '100%', mx: 'auto' }}
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
                    className="glass-paper"
                    sx={{
                        my: 4,
                        p: 2
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
                                sx={{ maxWidth: 280, width: '100%', height: '100%', mx: 'auto' }}
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
        </Box >
    );
}
