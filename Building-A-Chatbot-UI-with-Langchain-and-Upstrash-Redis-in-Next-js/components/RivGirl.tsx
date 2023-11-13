"use client"
import { useRive } from "@rive-app/react-canvas";

export const RivGirl = () => {
    const { RiveComponent } = useRive({
        src: "/girl.riv",
        autoplay: true,
    });

    return (
        <div className="max-h-screen ps-64" style={{ width: "500px", height: "700px" }}>
            <RiveComponent />
        </div>
    )
}