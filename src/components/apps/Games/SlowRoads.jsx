import './slowroads.css';

function SlowRoads() {
	return (
		<iframe
			src="https://slowroads.io/"
			title="SlowRoads"
			className="slowroads-iframe"
			loading="lazy"
			allow="fullscreen; gamepad; autoplay"
			referrerPolicy="strict-origin-when-cross-origin"
		/>
	);
}

export default SlowRoads;
