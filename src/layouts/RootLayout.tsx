import { useState, useEffect, useMemo } from "react";
import {
    CssBaseline,
    Container,
    Box,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    CSSObject,
    Theme,
    Badge,
    Menu,
    MenuItem,
    styled
} from "@mui/material";
import {
    AccessTime as AccessTimeIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CalculateIcon from '@mui/icons-material/Calculate';
import HubIcon from '@mui/icons-material/Hub';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSettingsStore } from "../store/useSettingsStore";
import TitleBar from "../components/TitleBar";
import { AnimatePresence, motion } from "framer-motion";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const MuiDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...(open && {
            ...openedMixin(theme),
            "& .MuiDrawer-paper": openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            "& .MuiDrawer-paper": closedMixin(theme),
        }),
    })
);

import { useTranslation } from "react-i18next";
import { useProjectStore } from "../store/useProjectStore";
//...
export default function RootLayout() {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { appBackground, init, selectedProjectId, setSelectedProjectId } = useSettingsStore();
    const { projects } = useProjectStore();
    const { t } = useTranslation();

    const handleProjectClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProjectClose = () => {
        setAnchorEl(null);
    };

    const handleProjectSelect = (id: string) => {
        setSelectedProjectId(id);
        setAnchorEl(null);
    };

    const selectedProject = useMemo(() => {
        if (!selectedProjectId || selectedProjectId === 'all' || selectedProjectId === 'unassigned') return null;
        return projects.find(p => p.id === selectedProjectId) || null;
    }, [projects, selectedProjectId]);

    useEffect(() => {
        init();
    }, [init]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const menuItems = [
        { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: "/" },
        { text: t('navigation.projects'), icon: <AccountTreeIcon />, path: "/projects" },
        { isDivider: true, id: 'divider-1' },
        { text: t('navigation.modules'), icon: <ViewModuleIcon />, path: "/modules" },
        { text: t('navigation.features'), icon: <CalculateIcon />, path: "/features" },
        { text: t('navigation.structure'), icon: <HubIcon />, path: "/structure" },
        { text: t('navigation.table'), icon: <TableChartIcon />, path: "/table" },
    ];

    const bottomMenuItems = [
        { text: t('navigation.settings'), icon: <SettingsIcon />, path: "/settings" },
    ];

    return (
        <Box sx={{ display: "flex", mt: "30px" }}> {/* Margin top for TitleBar */}
            <CssBaseline />

            {/* Animated Background Layer */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0, // Changed from -1 to 0 to be visible above body bg
                    bgcolor: '#f6f6f6', // Fallback color
                }}
            >
                <AnimatePresence mode="popLayout">
                    {appBackground && (
                        <motion.div
                            key={appBackground}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${appBackground})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    )}
                </AnimatePresence>
            </Box>

            <TitleBar />
            <MuiDrawer variant="permanent" open={open} PaperProps={{ sx: { top: "30px", height: "calc(100% - 30px)" } }}>
                <DrawerHeader sx={{ justifyContent: open ? 'flex-start' : 'center', px: open ? 2 : 1 }}>
                    <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen} sx={{ p: 1 }}>
                        <AccessTimeIcon color="primary" />
                    </IconButton>
                    {open && (
                        <Typography variant="h6" noWrap component="div" sx={{ ml: 1, fontWeight: 'bold' }}>
                            {t('common.app_name')}
                        </Typography>
                    )}
                </DrawerHeader>
                <Divider />
                <List>
                    {menuItems.map((item) => {
                        if (item.isDivider) {
                            return <Divider key={item.id} sx={{ my: 1 }} />;
                        }
                        return (
                            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path!)}
                                    sx={[
                                        {
                                            minHeight: 48,
                                            px: 2.5,
                                        },
                                        open
                                            ? {
                                                justifyContent: "initial",
                                            }
                                            : {
                                                justifyContent: "center",
                                            },
                                    ]}
                                >
                                    <ListItemIcon
                                        sx={[
                                            {
                                                minWidth: 0,
                                                justifyContent: "center",
                                            },
                                            open
                                                ? {
                                                    mr: 3,
                                                }
                                                : {
                                                    mr: "auto",
                                                },
                                        ]}
                                    >
                                        {item.path === "/projects" && selectedProject ? (
                                            <Badge
                                                variant="dot"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        backgroundColor: selectedProject.color || 'primary.main',
                                                    }
                                                }}
                                            >
                                                {item.icon}
                                            </Badge>
                                        ) : (
                                            item.icon
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text!}
                                        sx={[
                                            open
                                                ? {
                                                    opacity: 1,
                                                }
                                                : {
                                                    opacity: 0,
                                                },
                                        ]}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <List>
                    {bottomMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path!)}
                                sx={[
                                    {
                                        minHeight: 48,
                                        px: 2.5,
                                    },
                                    open
                                        ? {
                                            justifyContent: "initial",
                                        }
                                        : {
                                            justifyContent: "center",
                                        },
                                ]}
                            >
                                <ListItemIcon
                                    sx={[
                                        {
                                            minWidth: 0,
                                            justifyContent: "center",
                                        },
                                        open
                                            ? {
                                                mr: 3,
                                            }
                                            : {
                                                mr: "auto",
                                            },
                                    ]}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={[
                                        open
                                            ? {
                                                opacity: 1,
                                            }
                                            : {
                                                opacity: 0,
                                            },
                                    ]}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                {selectedProject && (
                    <>
                        <Divider />
                        <List sx={{ mb: 1 }}>
                            <ListItem disablePadding sx={{ display: "block" }}>
                                <ListItemButton
                                    onClick={handleProjectClick}
                                    sx={[
                                        {
                                            minHeight: 48,
                                            px: 2.5,
                                        },
                                        open
                                            ? {
                                                justifyContent: "initial",
                                                flexDirection: "row"
                                            }
                                            : {
                                                justifyContent: "center",
                                                flexDirection: "column-reverse",
                                                py: 2,
                                                height: 'auto'
                                            },
                                    ]}
                                >
                                    <ListItemIcon
                                        sx={[
                                            {
                                                minWidth: 0,
                                                justifyContent: "center",
                                                alignItems: "center"
                                            },
                                            open
                                                ? {
                                                    mr: 3,
                                                    mb: 0,
                                                    mt: 0
                                                }
                                                : {
                                                    mr: "auto",
                                                    ml: "auto",
                                                    mb: 0,
                                                    mt: 2
                                                },
                                        ]}
                                    >
                                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: selectedProject.color || 'primary.main', flexShrink: 0 }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={selectedProject.title}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: 'bold',
                                            noWrap: true,
                                            sx: open ? {} : {
                                                writingMode: 'vertical-rl',
                                                transform: 'rotate(180deg)',
                                                whiteSpace: 'nowrap'
                                            }
                                        }}
                                        sx={[
                                            open
                                                ? {
                                                    opacity: 1,
                                                    m: 0
                                                }
                                                : {
                                                    opacity: 1,
                                                    m: 0,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    overflow: 'visible'
                                                },
                                        ]}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleProjectClose}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: open ? 'left' : 'center',
                            }}
                            transformOrigin={{
                                vertical: 'bottom',
                                horizontal: open ? 'left' : 'center',
                            }}
                        >
                            <MenuItem
                                selected={selectedProjectId === 'all'}
                                onClick={() => handleProjectSelect('all')}
                            >
                                <ListItemIcon>
                                    <AccountTreeIcon fontSize="small" />
                                </ListItemIcon>
                                Alle Projekte
                            </MenuItem>
                            <Divider />
                            {projects.map((project) => (
                                <MenuItem
                                    key={project.id}
                                    selected={selectedProjectId === project.id}
                                    onClick={() => handleProjectSelect(project.id)}
                                >
                                    <ListItemIcon>
                                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: project.color || 'primary.main', display: 'inline-block' }} />
                                    </ListItemIcon>
                                    {project.title}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}
            </MuiDrawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    height: 'calc(100vh - 30px)',
                    overflowY: 'auto',
                    position: 'relative', // Ensure stacking context
                    zIndex: 1, // Sit above background
                    // Background moved to separate layer
                }}
            >
                <DrawerHeader />
                <Container maxWidth="xl">
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
}
