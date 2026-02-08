import { Typography } from "@mui/material";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { useTranslation } from "react-i18next";
//...
export default function TitleBar() {
    const { t } = useTranslation();
    const handleMouseDown = () => {
        getCurrentWindow().startDragging();
    };

    return (
        <div
            data-tauri-drag-region
            onMouseDown={handleMouseDown}
            style={{
                height: "30px",
                background: "#f5f5f5",
                borderBottom: "1px solid #000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                userSelect: "none",
                cursor: "default",
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 300,
                    fontSize: "0.8rem",
                    color: "#333",
                    pointerEvents: "none",
                }}
            >
                {t('common.app_name')}
            </Typography>
        </div>
    );
}
