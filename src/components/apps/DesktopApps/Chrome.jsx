export default function Chrome(){
	return (
		<div className="mock-app mock-chrome">
			<div className="mock-chrome-toolbar">
				<div className="mock-chrome-dots">
					<span />
					<span />
					<span />
				</div>
				<div className="mock-chrome-address">https://flavortown.local/desktop</div>
			</div>
			<div className="mock-chrome-body">
				<h3>Chrome App Window</h3>
				<p>This runs as an internal window in your WebOS desktop.</p>
			</div>
		</div>
	);
}
