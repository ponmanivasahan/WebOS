export default function VSCode(){
	return (
		<div className="mock-app mock-vscode">
			<aside className="mock-vscode-sidebar">
				<span>EXPLORER</span>
				<span>SEARCH</span>
				<span>SOURCE CONTROL</span>
				<span>RUN</span>
			</aside>
			<main className="mock-vscode-editor">
				<div className="mock-vscode-tabs">App.js | Taskbar.jsx | windowManager.jsx</div>
				<pre className="mock-vscode-code">{`const startMenu = useMemo(() => ({\n  layout: 'windows-11',\n  mode: 'local-apps-only'\n}), []);`}</pre>
			</main>
		</div>
	);
}
