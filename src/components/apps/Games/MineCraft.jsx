import './minecraft.css';

function Minecraft() {
	return (
		<div className="minecraft-app-shell">
			<iframe
				src="https://classic.minecraft.net/"
				title="Minecraft"
				className="minecraft-iframe"
				loading="lazy"
				allow="fullscreen; gamepad; autoplay"
				referrerPolicy="strict-origin-when-cross-origin"
			/>
		</div>
	);
}

export default Minecraft;
