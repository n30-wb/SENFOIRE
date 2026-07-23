export default function AuroraBackground({ colors = 'blue', className = '' }) {
    const palettes = {
        blue: ['#3b82f6', '#8b5cf6', '#06b6d4', '#6366f1'],
        emerald: ['#10b981', '#14b8a6', '#059669', '#0d9488'],
        amber: ['#f59e0b', '#f97316', '#eab308', '#fb923c'],
        orange: ['#f97316', '#ef4444', '#fb923c', '#dc2626'],
        red: ['#ef4444', '#f43f5e', '#dc2626', '#e11d48'],
        purple: ['#8b5cf6', '#a855f7', '#7c3aed', '#c084fc'],
        success: ['#10b981', '#22c55e', '#059669', '#16a34a'],
    };

    const palette = palettes[colors] || palettes.blue;

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div
                className="aurora-blob absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
                style={{
                    background: `radial-gradient(circle, ${palette[0]}, transparent 70%)`,
                    top: '-10%',
                    left: '-5%',
                    animation: 'auroraFloat1 18s ease-in-out infinite',
                }}
            />
            <div
                className="aurora-blob absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[100px]"
                style={{
                    background: `radial-gradient(circle, ${palette[1]}, transparent 70%)`,
                    bottom: '-15%',
                    right: '-10%',
                    animation: 'auroraFloat2 22s ease-in-out infinite',
                }}
            />
            <div
                className="aurora-blob absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[80px]"
                style={{
                    background: `radial-gradient(circle, ${palette[2]}, transparent 70%)`,
                    top: '40%',
                    left: '30%',
                    animation: 'auroraFloat3 20s ease-in-out infinite',
                }}
            />
            <div
                className="aurora-blob absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[90px]"
                style={{
                    background: `radial-gradient(circle, ${palette[3]}, transparent 70%)`,
                    top: '10%',
                    right: '20%',
                    animation: 'auroraFloat4 25s ease-in-out infinite',
                }}
            />

            <div className="absolute inset-0" style={{
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
            }} />
        </div>
    );
}
