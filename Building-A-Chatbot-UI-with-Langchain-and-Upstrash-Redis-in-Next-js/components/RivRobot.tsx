"use client"
import { useRive } from "@rive-app/react-canvas";

export const RivRobot = () => {
    const { rive, RiveComponent } = useRive({
        src: "/robot.riv",
        autoplay: true,
        onStop: () => {
            console.log("stopped")
            console.log(rive)
            rive?.play()
        }
    });

    return (
        <div style={{ width: "1200px", height: "600px" }}>
            <RiveComponent />
        </div>
    )
}