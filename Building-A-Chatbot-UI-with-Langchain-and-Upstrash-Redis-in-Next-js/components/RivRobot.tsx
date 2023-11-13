"use client"
import { useRive } from "@rive-app/react-canvas";

export const RivRobot = () => {
    const { RiveComponent } = useRive({
        src: "/robot.riv",
        autoplay: true,
    });

    return (
        <div style={{ width: "500px", height: "800px" }}>
            <RiveComponent />
        </div>
    )
}