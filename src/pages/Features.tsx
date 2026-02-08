import { Box, Typography, Fab, Paper } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import { useFeatureStore, Feature } from "../store/useFeatureStore";
import FeatureCard from "../components/FeatureCard";
import FeatureDrawer from "../components/FeatureDrawer";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { spring } from "../constants";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);


import { useTranslation } from "react-i18next";

export default function Features() {
    const { features, init, deleteFeature, toggleFeature } = useFeatureStore();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const completedFeatures = features.filter(f => f.completed);
    const activeFeatures = features.filter(f => !f.completed);
    const { t } = useTranslation();

    useEffect(() => {
        init();
    }, [init]);

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 100, color: 'text.secondary' }}>
                        {t('features.title', "Features")}
                    </Typography>
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
