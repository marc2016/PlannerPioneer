import { Typography, Box, Paper, Grid, Card, CardMedia, CardActionArea } from "@mui/material";
import { useSettingsStore } from "../store/useSettingsStore";

// Import all backgrounds
import greenField from "../assets/backgrounds/green-field.jpg";
import lakeStarryNight from "../assets/backgrounds/lake-starry-night.jpg";
import snowForestRoad from "../assets/backgrounds/snow-forest-road.jpg";
import islandSea from "../assets/backgrounds/island-sea.jpg";
import churchSnowMountains from "../assets/backgrounds/church-snow-mountains.jpg";
import wood from "../assets/backgrounds/wood.png";

const backgrounds = [
    { id: 'green-field', src: greenField, name: 'Green Field' },
    { id: 'lake-starry-night', src: lakeStarryNight, name: 'Lake Starry Night' },
    { id: 'snow-forest-road', src: snowForestRoad, name: 'Snow Forest Road' },
    { id: 'island-sea', src: islandSea, name: 'Island Sea' },
    { id: 'church-snow-mountains', src: churchSnowMountains, name: 'Church Snow Mountains' },
    { id: 'wood', src: wood, name: 'Wood' },
];

export default function Settings() {
    const { appBackground, setAppBackground } = useSettingsStore();

    return (
        <Box>
            {/* Use a translucent Paper to ensure text readability over any background */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Semi-transparent white
                    backdropFilter: 'blur(8px)', // Blur effect for glassmorphism
                    borderRadius: 2
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Settings
                </Typography>

                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    App Background
                </Typography>

                <Grid container spacing={2}>
                    {backgrounds.map((bg) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bg.id}>
                            <Card
                                sx={{
                                    border: appBackground === bg.src ? '3px solid #1976d2' : 'none',
                                    boxShadow: appBackground === bg.src ? 3 : 1
                                }}
                            >
                                <CardActionArea onClick={() => setAppBackground(bg.src)}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={bg.src}
                                        alt={bg.name}
                                    />
                                    <Box sx={{ p: 1, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {bg.name}
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
}
