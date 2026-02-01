import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function HomePage()
{
    const navigate = useNavigate();

    return (
        <nav className="w-full h-16 border-b bg-background px-6 flex items-center">
        
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
                <h1 className="text-xl font-bold tracking-tight">
                Res-N-Play
                </h1>

                <Input
                type="text"
                placeholder="Search..."
                className="max-w-xs"
                />
            </div>

            {/* Center Section */}
            <div className="flex justify-center flex-1">
                <Button size="icon" variant="default">
                <Play className="h-5 w-5" />
                </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end gap-3 flex-1">
                <Button onClick={() => navigate("/login")}>
                    Login / Sign Up
                </Button>
            </div>

        </nav>
    )
}