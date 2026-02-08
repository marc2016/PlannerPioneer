import { useState, useEffect } from "react";
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
    styled
} from "@mui/material";
import {
    AccessTime as AccessTimeIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
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

export default function RootLayout() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { appBackground, init } = useSettingsStore();

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
        { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
        { text: "Projects", icon: <AccountTreeIcon />, path: "/projects" },
        { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
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
                            PlannerPioneer
                        </Typography>
                    )}
                </DrawerHeader>
                <Divider />
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
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
